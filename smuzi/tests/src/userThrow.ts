import { dump, Err, Ok, Result } from "@smuzi/std";
import { it, describe, MysSetup } from "./newThrow.js";

interface Assert {
    equal<T = unknown>(actual: unknown, expected: T): asserts actual is T;
}


const assert: Assert = {
    equal<T = unknown>(actual: unknown, expected: T): asserts actual is T {
        if (actual !== expected) {
        throw {
                expected,
                actual,
                operator: '==',
                message: "Not equal"
        }}
    }
}

export default describe<MysSetup>("users - ", [
    it("get user", async (setup) => {
         assert.equal(1,1);
         assert.equal(2,1);
         assert.equal(3,3);
    })
]);