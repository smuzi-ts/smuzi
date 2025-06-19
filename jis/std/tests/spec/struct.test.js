import {
    Struct,
    STRUCT_NAME_FIELD,
    TYPE_STRUCT_INSTANCE,
    TYPE_NAME_FIELD,
    S,
    StructValidationException
} from "#lib/spec.js";
import {isStructInstance} from "#lib/utils.js";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt, skip} from "@jis/tests";

describe("Spec-Struct", () => {

    it("Schema with string field", () => {
        checkStructureBySchema({
            field: S.string()
        });
    })

    it("Schema with integer field", () => {
        checkStructureBySchema({
            field: S.integer()
        });
    })

    it("Schema with boolean field", () => {
        checkStructureBySchema({
            field: S.bool()
        });
    })

    it("Schema with float field", () => {
        checkStructureBySchema({
            field: S.float()
        });
    })

    it("Schema with array", () => {
        checkStructureBySchema({
            field: S.array()
        });
    })

    repeatIt(5,"Input data is valid structure", (name) => {
        it(name, () => {
            checkStructureBySchema(faker.spec.schema());
        })
    })

    it("One schema, different structures",() => {
        const schema = faker.spec.schema();

        const StructInterface1 = Struct(faker.spec.structName(), schema);
        const StructInterface2 = Struct(faker.spec.structName(), schema);

        const inputData = faker.spec.objBySchema(schema);

        const resultInstance = StructInterface1(inputData);
        inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
        inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];

        assert.isStructInstance(resultInstance, StructInterface1);
        assert.ok(! isStructInstance(resultInstance, StructInterface2), `Expected that resultInstance implementing ${StructInterface1[STRUCT_NAME_FIELD].description}, but actual structure ${StructInterface2[STRUCT_NAME_FIELD.description]}`);
    })

    it("Input data is INVALID structure",() => {
        const schema = {
            field1: S.string(),
            field2: S.integer(),
            field3: S.bool(),
        };

        const StructInterface = Struct(faker.string({max: 5, suffix: "Struct"}), schema);

        const badInputData = {
            field1: 100,
            field2: "stringInsteadOfInteger",
            field3: 2,
        };

        assert.expectErrorInstOf(
            err => err instanceof StructValidationException,
            () => StructInterface(badInputData)
        )
    })
})

function checkStructureBySchema(schema) {
    const StructInterface = Struct(faker.spec.structName(), schema);
    const inputData = faker.spec.objBySchema(schema);
    const resultInstance = StructInterface(inputData);

    assert.isStructInstance(resultInstance, StructInterface)

    inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
    inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];
    assert.deepEqual(resultInstance, inputData)
}
