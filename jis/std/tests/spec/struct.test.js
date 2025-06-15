import {Struct, STRUCT_NAME_FIELD, TYPE_STRUCT_INSTANCE, TYPE_NAME_FIELD, S} from "#lib/spec.js";
import {isStructInstance} from "#lib/utils.js";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt} from "@jis/tests";

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

    repeatIt(5,"Input data is valid structure", (name) => {
        it(name, () => {
            checkStructureBySchema(faker.spec.schema(5,10));
        })
    })

    it("One schema, different structures",() => {
        const schema = faker.spec.schema(5,10);

        const StructInterface1 = Struct(faker.spec.structName(), schema);
        const StructInterface2 = Struct(faker.spec.structName(), schema);

        const inputData = faker.spec.objBySchema(schema);

        const resultInstance = StructInterface1(inputData);
        inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
        inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];

        assert.isStructInstance(resultInstance, StructInterface1);
        assert.ok(! isStructInstance(resultInstance, StructInterface2), `Expected that resultInstance implementing ${StructInterface1[STRUCT_NAME_FIELD].description}, but actual structure ${StructInterface2[STRUCT_NAME_FIELD.description]}`);
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
