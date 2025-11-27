import { dump, Err, None, Ok, Option, Result, Some, tranformError } from "@smuzi/std";

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

type TestCase = () => Promise<TestCaseResult> | TestCaseResult
type It = () => Promise<TestCaseResult> | TestCaseResult
type Describe = (options: DescribeOptions) => Promise<TestCaseResult[]> | TestCaseResult[]

export function describe(msg: string, cases: It[]): Describe {
    return async (options: DescribeOptions = {
        beforeEachCase: None(),
        afterEachCase: None(),
    }) => {
        const results: TestCaseResult[] = [];
        for (const it of cases) {
            await options.beforeEachCase.asyncMapSome();
            results.push(await it());
            await options.afterEachCase.asyncMapSome();
        }
        return results;
    }
}

export function it(msg: string, testCase: TestCase): It {
    return async () => {
        try {
            await testCase();
            return Ok({msg});
        } catch (error) {
            return Err({msg, error});
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
    for (const describe of descibes) {
        const globalSetup = await beforeGlobal.asyncMapSome();
        const describeResults = await describe({
            beforeEachCase: beforeEachCase,
            afterEachCase: afterEachCase,
        });
        await afterGlobal.asyncMapSome(globalSetup);
    }
}