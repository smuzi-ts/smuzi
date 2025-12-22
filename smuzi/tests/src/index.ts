import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {argv} from 'node:process';

export {assert} from "#lib/assert.js"
import {
    dump,
    Err,
    isEmpty,
    isNone,
    json,
    None,
    Ok,
    Option,
    panic,
    Result,
    Some,
    StdError, StdMap,
    StdRecord,
    tranformError
} from "@smuzi/std";
import {
    CommandAction,
    commandHandler,
    ConsoleCommand,
    CreateConsoleRouter,
    StandardOutput,
    StandardThema,
    SystemInputParser,
    SystemInputParserWithoutPath,
    TConsoleConfig,
    TInputParams,
    TOutputConsole,
    TThemaOutputConsole
} from "@smuzi/console";


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

type DescribeOptions<GS extends unknown> = {
    inputParams: TestRunnerInputParams,
    config: TestConfig,
    globalSetup: GS,
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

type TestCase<GS extends Option> =  (globalSetup: GS) => Promise<void> | void

type ItResult<GS extends Option> = {
    msg: string,
    testCase: (globalSetup: GS) => Promise<TestCaseResult> | TestCaseResult
};


type Describe<GS extends Option> = (options: DescribeOptions<GS>) => Promise<DescribeResult> | DescribeResult

export function it<GS extends Option>(msg: string, testCase: TestCase<GS>): ItResult<GS> {
    return {
        msg,
        testCase: async (globalSetup) => {
            try {
                await testCase(globalSetup);
                return Ok(true);
            } catch (error) {
                return Err(error);
            }
        }
    }
}

export type PipelineResult = { ok: number, err: number };

export type PipelineTest = (output: TOutputConsole, inputParams) => Promise<PipelineResult>;


export async function loadDescribesFromDir(dir = "./tests", fileSuffix = '.test.ts') {
    const entries = await fs.promises.readdir(dir, {withFileTypes: true});

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await loadDescribesFromDir(fullPath);
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(fileSuffix)) {
            await import(pathToFileURL(fullPath).href);
        }
    }
}

export type TestRunnerConfig<GS extends Option> = {
    argv?: string[],
    folder?: string,
    config?: TestConfig;
    beforeGlobal?: Option<() => Promise<GS | void>>;
    afterGlobal?: Option<(globalSetup: GS) => Promise<void>>;
    beforeEachCase?: Option<() => Promise<void>>;
    afterEachCase?: Option<() => Promise<void>>;
    describes?: Describe<GS>[];
}

type KeysTestRunnerInputParams = 'contains';
export type TestRunnerInputParams = StdMap<KeysTestRunnerInputParams, string>;

export class TestRunner<GS extends Option> {
    #inputParams: StdMap<KeysTestRunnerInputParams, string>
    #folder: string
    #config: TestConfig;
    #beforeGlobal: Option<() => Promise<GS | void>>;
    #afterGlobal: Option<(globalSetup: GS) => Promise<void>>;
    #beforeEachCase: Option<() => Promise<void>>;
    #afterEachCase: Option<() => Promise<void>>;
    #describes: Describe<GS>[];
    
    constructor({
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
                    describes = []
                }: TestRunnerConfig<GS> = {})
    {
        this.#inputParams = SystemInputParserWithoutPath<KeysTestRunnerInputParams>(argv).params;
        this.#folder = folder;
        this.#config = config;
        this.#beforeGlobal = beforeGlobal;
        this.#afterGlobal = afterGlobal;
        this.#beforeEachCase = beforeEachCase;
        this.#afterEachCase = afterEachCase;
        this.#describes = describes;
    }

    async run() {
        if (isEmpty(this.#describes) && isEmpty(this.#folder)) {
            return;
        }
        if (isEmpty(this.#describes))
        {
            await loadDescribesFromDir(this.#folder);
        }

        const filterByMsg = this.#inputParams.get("contains")
            .mapSome(strSearch => {
                return (msg: string) => !msg.includes(strSearch)
            })

        const generalResult = {
            ok: 0,
            err: 0,
            skip: 0,
        }
        const globalSetup = await this.#beforeGlobal.asyncMapSome() as GS;

        for (const describe of this.#describes) {
            const describeResult = await describe({
                inputParams: this.#inputParams,
                config: this.#config,
                globalSetup,
                beforeEachCase: this.#beforeEachCase,
                afterEachCase: this.#afterEachCase,
                filters: {
                    byMsg: filterByMsg
                }
            });

            generalResult.ok += describeResult.ok;
            generalResult.err += describeResult.err;
            generalResult.skip += describeResult.skip;

        }

        await this.#afterGlobal.asyncMapSome(globalSetup);

        if (this.#config.output.format == "json") {
            this.#config.output.printer.info(json.toString(generalResult).unwrap());
        } else {
            this.#config.output.printer.info("ℹ️  ok: " + generalResult.ok);
            const errPrintMethod = generalResult.err > 0 ? "error" : "info";
            this.#config.output.printer[errPrintMethod]("ℹ️  err: " + generalResult.err);
            this.#config.output.printer.info("ℹ️  skip: " + generalResult.skip);
        }
    }

    describe(msg: string, cases: ItResult<GS>[]) {
        this.#describes.push(async (options) => {
            const result = {
                ok: 0,
                err: 0,
                skip: 0,
            }
            for (const it of cases) {
                await options.beforeEachCase.asyncMapSome();
                const generalMsg = msg + "-" + it.msg;
                const filteredByMsg = options.filters.byMsg.someOr(() => false);

                if (filteredByMsg(generalMsg)) {
                    ++result.skip;
                    continue;
                }

                (await it.testCase(options.globalSetup)).match({
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
        )
    }
}