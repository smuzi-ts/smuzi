import {isStructInstance, Struct, STRUCT_NAME_FIELD} from "#lib/dataTypes/Struct.ts";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt} from "@jis/tests";
import _assert from "node:assert/strict";

describe("Spec-Struct", () => {
    repeatIt(1,"Input data is valid structure", (name) => {
        it(name, () => {
            const schema = faker.spec.schema(5,10);
            const StructInterface = Struct(schema);
            const inputData = faker.spec.objBySchema(schema);
            const resultInstance = StructInterface(inputData);
            inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];

            assert.isStructInstance(resultInstance, StructInterface)
            assert.deepEqual(resultInstance, inputData)
        })
    })

    it("One schema, different structures",() => {
        const schema = faker.spec.schema(5,10);

        const StructInterface1 = Struct(schema, "Struct1");
        const StructInterface2 = Struct(schema, 'Struct2');

        const inputData = faker.spec.objBySchema(schema);

        const resultInstance = StructInterface1(inputData);
        inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];

        assert.isStructInstance(resultInstance, StructInterface1);
        _assert.ok(! isStructInstance(resultInstance, StructInterface2), `Expected that resultInstance implementing ${StructInterface1[STRUCT_NAME_FIELD].description}, but actual structure ${StructInterface2[STRUCT_NAME_FIELD.description]}`);
    })
})