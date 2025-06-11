import {describe, it} from "node:test";
import assert from 'node:assert';

import {Struct} from "#lib/dataTypes/Struct.ts";
import {Schema} from "#lib/Types.ts";

const inputData = {
    valString: "string",
    valBool: true,
}

describe("Safe Struct", () => {
    it("Correct data", (t) => {


        const StructInterface = Struct({
            valString: Schema.string()
        });

        const resultInstance = StructInterface(inputData)

        assert.deepEqual(resultInstance,inputData)
    })

    it("Correct bool", (t) => {
        const inputData = {
            valString: "string",
        }

        const StructInterface = Struct({
            valString: Schema.string()
        });

        const resultInstance = StructInterface(inputData)

        assert.deepEqual(resultInstance,inputData)
    })
})