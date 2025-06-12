import {Struct, STRUCT_NAME_FIELD} from "#lib/dataTypes/Struct.ts";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt} from "@jis/tests";

describe("Spec-Struct", () => {
    repeatIt(5,"Input data is valid structure", (name) => {
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

    it("One interface, different structures", () => {
        const schema = faker.spec.schema(5,10);

        const StructInterface1 = Struct(schema);
        const StructInterface2 = Struct(schema);

        const inputData = faker.spec.objBySchema(schema);

        const resultInstance = StructInterface2(inputData);
        inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];

        assert.isStructInstance(resultInstance, StructInterface)
    })
})