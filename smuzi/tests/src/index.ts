
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { argv } from 'node:process';

export { assert } from "#lib/assert.js"
import { dump, Err, isEmpty, isNone, json, None, Ok, Option, panic, Result, Some, StdError, StdRecord, tranformError } from "@smuzi/std";
import { CommandAction, commandHandler, ConsoleCommand, CreateConsoleRouter, StandardOutput, StandardThema, SystemInputParser, SystemInputParserWithoutPath, TConsoleConfig, TInputParams, TOutputConsole, TThemaOutputConsole } from "@smuzi/console";


export const okMsg = (msg = ""): string => `${msg} - exp ok`;
export const errMsg = (msg = ""): string => `${msg} - exp err`;
export const invalidMsg = (msg = ""): string => `${msg} - exp invalid`;

export type TAssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

export function assertionError(details: TAssertionError) {
    throw details;
}

export function repeatIt(
    repeat: number = 1,
    name: string = "",
    fn: (name: string) => void
): void {
    for (let i = 1; i <= repeat; i++) {
        fn(`${name} - #${i}`);
    }
}


export type AssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

type TestConfig = {
    output: {
        format: "text" | "json",
        printer: TOutputConsole,
    }
}

type DescribeOptions = {
    params: TestRunnerInputParams,
    config: TestConfig,
    beforeEachCase: Option<() => Promise<void>>,
    afterEachCase: Option<() => Promise<void>>,
    filters: {
        byMsg: Option<(msg: string) => boolean>
    }
};

type TestCaseOk = boolean;

type TestCaseErr = unknown;

type TestCaseResult = Result<TestCaseOk, TestCaseErr>
type DescribeResult = {
    ok: number,
    err: number,
    skip: number,
}

type TestCase = () => Promise<void> | void
type ItResult = {
    msg: string,
    testCase: () => Promise<TestCaseResult> | TestCaseResult
};

type It = (params: TestRunnerInputParams) => ItResult;

type Describe = (options: DescribeOptions) => Promise<DescribeResult> | DescribeResult

export function describe(msg: string, cases: ItResult[]): Describe {
    return async (options: DescribeOptions) => {
        const result = {
            ok: 0,
            err: 0,
            skip: 0,
        }
        for (const it of cases) {
            await options.beforeEachCase.asyncMapSome();
            const generalMsg = msg + " -> " + it.msg;
            const filteredByMsg = options.filters.byMsg.someOr(() => false);

            if (filteredByMsg(generalMsg)) {
                ++result.skip;
                continue;
            }

            (await it.testCase()).match({
                Ok(_) {
                    ++result.ok;
                    if (options.config.output.format == "json") {
                        options.config.output.printer.info(`{"describe":"${msg}","it":"${it.msg}","ok":true}`)
                    } else {
                        options.config.output.printer.success(generalMsg);
                    }
                },
                Err(error) {
                    ++result.err;
                    if (options.config.output.format == "json") {
                        options.config.output.printer.info(`{"describe":"${msg}","it":"${it.msg}","ok":false,"error":${json.toString(error)}}`)
                    } else {
                        options.config.output.printer.error(generalMsg);
                        options.config.output.printer.error(error);
                    }
                }
            });

            await options.afterEachCase.asyncMapSome();
        }
        return result;
    }
}

export function it(msg: string, testCase: TestCase): ItResult {
    return {
        msg,
        testCase: async () => {
            try {
                await testCase();
                return Ok(true);
            } catch (error) {
                return Err(error);
            }
        }
    }
}

export type PipelineResult = { ok: number, err: number };

export type PipelineTest = (output: TOutputConsole, params) => Promise<PipelineResult>;


export async function loadDescribesFromDir(dir = "./tests", fileSuffix = '.test.ts') {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const tests: Describe[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            tests.push(...await loadDescribesFromDir(fullPath));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(fileSuffix)) {
            const module = await import(pathToFileURL(fullPath).href);
            if (module.default) tests.push(module.default);
        }
    }

    return tests;
}

export type TestRunnerConfig<GS = unknown> = {
    argv?: string[],
    folder?: string,
    config?: TestConfig;
    beforeGlobal?: Option<() => Promise<GS | void>>;
    afterGlobal?: Option<(globalSetup: Option<GS>) => Promise<void>>;
    beforeEachCase?: Option<() => Promise<void>>;
    afterEachCase?: Option<() => Promise<void>>;
    descibes?: Describe[];
}

type KeysTestRunnerInputParams = 'contains';
export type TestRunnerInputParams = StdRecord<KeysTestRunnerInputParams, string>;

export async function testRunner<GS = unknown>({
    argv = process.argv,
    folder = "./tests",
    config = {
        output: {
            format: "text",
            printer: StandardOutput(StandardThema)
        }
    },
    beforeGlobal = None(),
    afterGlobal = None(),
    beforeEachCase = None(),
    afterEachCase = None(),
    descibes = []
}: TestRunnerConfig<GS> = {}) {
    if (isEmpty(descibes) && isEmpty(folder)) {
        panic("Argument descibes or folder is required!")
    }

    const params = SystemInputParserWithoutPath<KeysTestRunnerInputParams>(argv).params;

    const filterByMsg = params.get("contains")
        .mapSome(strSearch => {
            return (msg: string) =>  ! msg.includes(strSearch)
        })

    descibes = !isEmpty(descibes) ? descibes : await loadDescribesFromDir(folder);

    const generalResult = {
        ok: 0,
        err: 0,
        skip: 0,
    }

    for (const describe of descibes) {
        const globalSetup = await beforeGlobal.asyncMapSome();

        const describeResult = await describe({
            params,
            config,
            beforeEachCase: beforeEachCase,
            afterEachCase: afterEachCase,
            filters: {
                byMsg: filterByMsg
            }
        });

        generalResult.ok += describeResult.ok;
        generalResult.err += describeResult.err;
        generalResult.skip += describeResult.skip;

        await afterGlobal.asyncMapSome(globalSetup);
    }

    if (config.output.format == "json") {
        config.output.printer.info(json.toString(generalResult).unwrap());
    } else {
        config.output.printer.info("ℹ️  ok: " + generalResult.ok);
        config.output.printer.info("ℹ️  err: " + generalResult.err);
        config.output.printer.info("ℹ️  skip: " + generalResult.skip);
    }
}