import { None, Option, Some } from "@smuzi/std";

export type AssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

type GlobalSetup = Option;

type PipelineOptions = {
    beforeGlobal: Option<() => Promise<GlobalSetup>>;
    afterGlobal: Option<(globalSetup: GlobalSetup) => Promise<void>>;
    beforeEachCase: Option<() => Promise<void>>;
    afterEachCase: Option<() => Promise<void>>;
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


export async function pipelineTest(
    options: PipelineOptions = {
        beforeGlobal: None(),
        afterGlobal: None(),
        beforeEachCase: None(),
        afterEachCase: None(),
        descibes: []
    }
)   {
    for (const describe of options.descibes) {
        const globalSetup = await options.beforeGlobal.asyncMapSome();
        await describe({beforeEachCase: options.beforeEachCase, afterEachCase: options.afterEachCase,});
        await options.afterGlobal.asyncMapSome(globalSetup);
    }
}

