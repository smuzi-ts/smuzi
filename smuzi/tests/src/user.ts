import { dump, Err, Ok, Result } from "@smuzi/std";
import { it, describe, MysSetup } from "./new.js";
import { assertionError, TAssertionError } from "./index.js";


const assert = {
    equal(actual, expected): Result<true, TAssertionError> {
        if (actual === expected) {
           return Ok(true);
        }

        return Err({
                expected,
                actual,
                operator: '==',
                message: "Not equal"
        })
    }
}

export default describe<MysSetup>("users - ", [
    it("get user", async function*(setup) {
        yield assert.equal(1,1);
        yield assert.equal(2,1);
        yield assert.equal(3,3);
    })
]);