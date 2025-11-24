import { Ok, Option, Pipe, Result } from "@smuzi/std"

import user from "#lib/userThrow.js";
import { TAssertionError } from "./index.js";
import { log } from "console";

export type AssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

type AssertResult = void;
type TestCase<Setup extends unknown> = (setup: Setup) => Promise<AssertResult>
type It<Setup extends unknown> =  (describeMsg: string, setup: Setup) => Promise<AssertResult>


export function describe<Setup>(msg: string, cases: It<Setup>[]) {
    return async (setup: Setup): Promise<void> => {
        for (const it of cases) {
            await it(msg, setup);
        }
    }
}

export function it<Setup>(msg: string, testCase: TestCase<Setup>): It<Setup> {
    return async (describeMsg: string, setup: Setup): Promise<void> => {
        console.info(describeMsg + msg);
        try {
            await testCase(setup);
        } catch(error) {
            console.error("Error", error);
        }
    }
}


export type MysSetup = { dbClient: string };


//Client code

const mySetup = { dbClient: "Postgres" };

const pipelines = [
    user
];

for (const pipe of pipelines) {
    await pipe(mySetup)
}