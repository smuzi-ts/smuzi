import { None, Option, Some } from "@smuzi/std";

export type AssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

type PipelineOptions<GS extends unknown> = {
    beforeGlobal?: Option<() => Promise<GS | void>>;
    afterGlobal?: Option<(globalSetup: Option<GS>) => Promise<void>>;
    beforeEachCase?: Option<() => Promise<void>>;
    afterEachCase?: Option<() => Promise<void>>;
    descibes: Describe[];
};

type DescribeOptions = {
    beforeEachCase: Option<() => Promise<void>>;
    afterEachCase: Option<() => Promise<void>>;
};


type TestCase = () => Promise<void>
type It = (describeMsg: string) => Promise<void>
type Describe = (options: DescribeOptions ) => Promise<void>

export function describe(msg: string, cases: It[]): Describe {
    return async (options: DescribeOptions = {
        beforeEachCase: None(),
        afterEachCase: None(),
     }) => {
        for (const it of cases) {
            await options.beforeEachCase.asyncMapSome();
            await it(msg);
            await options.afterEachCase.asyncMapSome();
        }
    }
}

export function it(msg: string, testCase: TestCase): It {
    return async (describeMsg: string): Promise<void> => {
        console.info(describeMsg + msg);
        try {
            await testCase();
        } catch (error) {
            console.error("Error", error);
        }
    }
}

export async function pipelineTest<GS extends unknown>(
     {
        beforeGlobal = None(),
        afterGlobal = None(),
        beforeEachCase = None(),
        afterEachCase = None(),
        descibes = []
    }: PipelineOptions<GS> = { descibes: [] }
)   {
    for (const describe of descibes) {
        const globalSetup = await beforeGlobal.asyncMapSome();
        await describe({
            beforeEachCase: beforeEachCase,
            afterEachCase: afterEachCase,
        });
        await afterGlobal.asyncMapSome(globalSetup);
    }
}