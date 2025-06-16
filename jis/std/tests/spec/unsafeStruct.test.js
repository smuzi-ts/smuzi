import {
    Struct,
    STRUCT_NAME_FIELD,
    TYPE_STRUCT_INSTANCE,
    TYPE_NAME_FIELD,
    UnsafeStruct,
    S,
} from "#lib/spec.js";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt} from "@jis/tests";

describe("Spec-UnsafeStruct", () => {
    repeatIt(5,"Input data is VALID unsafe structure", (name) => {
        it(name, () => {
            checkStructureBySchema(faker.spec.schema(5,10));
        })
    })


    it("Input data is INVALID unsafe structure",() => {
        const schema = {
            field1: S.string(),
            field2: S.integer(),
            field3: S.bool(),
        };

        const StructInterface = UnsafeStruct(faker.string({max: 5, suffix: "Struct"}), schema);

        const badInputData = {
            field1: 100,
            field2: "stringInsteadOfInteger",
            field3: 2,
        };

        let result = StructInterface(badInputData);

        assert.expectResultErr(result, {
            field1: {actual: "number", expected: "string"},
            field2: {actual: "string", expected: "integer"},
            field3: {actual: "number", expected: "boolean"},
        });
    })
})

function checkStructureBySchema(schema) {
    const StructInterface = UnsafeStruct(faker.string({max: 5, suffix: "Struct"}), schema);
    const inputData = faker.spec.objBySchema(schema);
    const result = StructInterface(inputData);
    const resultInstance = result.val;
    assert.isStructInstance(resultInstance, StructInterface)

    inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
    inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];
    assert.deepEqual(resultInstance, inputData)
}
