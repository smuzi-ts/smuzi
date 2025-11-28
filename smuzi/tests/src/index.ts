
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export { assert } from "#lib/assert.js"
import { dump, Err, json, None, Ok, Option, Result, Some, tranformError } from "@smuzi/std";
import { config } from "process";


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

type PipelineOptions<GS extends unknown> = {
    config?: TestConfig;
    beforeGlobal?: Option<() => Promise<GS | void>>;
    afterGlobal?: Option<(globalSetup: Option<GS>) => Promise<void>>;
    beforeEachCase?: Option<() => Promise<void>>;
    afterEachCase?: Option<() => Promise<void>>;
    descibes: Describe[];
};

type TestConfig = {
    outputFormat: "text" | "json"
}

type DescribeOptions = {
    config: TestConfig,
    beforeEachCase: Option<() => Promise<void>>;
    afterEachCase: Option<() => Promise<void>>;
};

type TestCaseOk = {
    msg: string
}

type TestCaseErr = {
    msg: string
    error: AssertionError
}

type TestCaseResult = Result<TestCaseOk, TestCaseErr>
type DescribeResult = {
    ok: number,
    err: number,
}

type TestCase = () => Promise<void> | void
type It = () => Promise<TestCaseResult> | TestCaseResult
type Describe = (options: DescribeOptions) => Promise<DescribeResult> | DescribeResult

export function describe(msg: string, cases: It[]): Describe {
    return async (options: DescribeOptions) => {
        const result = {
            ok: 0,
            err: 0,
        }
        for (const it of cases) {
            await options.beforeEachCase.asyncMapSome();
            (await it()).match({
                Ok(itRes) {
                    ++result.ok;
                    if (options.config.outputFormat == "json") {
                        console.log(`{"describe":"${msg}","it":"${itRes.msg}","ok":true}`)
                    } else {
                        console.log(msg + " -> " + itRes.msg);
                    }
                },
                Err(itRes) {
                    ++result.err;
                    if (options.config.outputFormat == "json") {
                        console.log(`{"describe":"${msg}","it":"${itRes.msg}","ok":false,"error":${json.toString(itRes.error)}}`)
                    } else {
                        console.log(msg + " -> " + itRes.msg);
                        console.error(itRes.error);
                    }
                }
            });

            await options.afterEachCase.asyncMapSome();
        }
        return result;
    }
}

export function it(msg: string, testCase: TestCase): It {
    return async () => {
        try {
            await testCase();
            return Ok({ msg });
        } catch (error) {
            return Err({ msg, error });
        }

    }
}

export async function pipelineTest<GS extends unknown>(
    {
        config = {
            outputFormat: "text",
        },
        beforeGlobal = None(),
        afterGlobal = None(),
        beforeEachCase = None(),
        afterEachCase = None(),
        descibes = []
    }: PipelineOptions<GS> = { descibes: [] }
) {
    const generalResult = {
        ok: 0,
        err: 0,
    }

    for (const describe of descibes) {
        const globalSetup = await beforeGlobal.asyncMapSome();

        const describeResult = await describe({
            config,
            beforeEachCase: beforeEachCase,
            afterEachCase: afterEachCase,
        });

        generalResult.ok += describeResult.ok;
        generalResult.err += describeResult.err;
        await afterGlobal.asyncMapSome(globalSetup);
    }

    if (config.outputFormat == "json") {
        console.log(json.toString(generalResult).unwrap());
    } else {
        console.log("- ok: " + generalResult.ok);
        console.log("- err: " + generalResult.err);
    }

    return generalResult;
}


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