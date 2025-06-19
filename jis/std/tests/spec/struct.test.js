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
import {assert, describe, it, repeatIt, skip, ok, err} from "@jis/tests";

describe("Spec-Struct", () => {

    it(ok("Schema with string field"), () => {
        checkStructureBySchema({
            field: S.string()
        });
    })

    it(ok("Schema with integer field"), () => {
        checkStructureBySchema({
            field: S.integer()
        });
    })

    it(ok("Schema with boolean field"), () => {
        checkStructureBySchema({
            field: S.bool()
        });
    })

    it(ok("Schema with float field"), () => {
        checkStructureBySchema({
            field: S.float()
        });
    })

    it(ok("Schema with array field"), () => {
        checkStructureBySchema({
            field: S.array()
        });
    })

    it(err("Schema with array field"),() => {
        const StructInterface = Struct("Struct1", {
            field1: S.array(),
        });

        const badInputData = {
            field1: "stringInsteadOfArray",
        };

        assert.expectErrorInstOf(
            err => {
                return (err instanceof StructValidationException && err?.meta?.)
            },
            () => StructInterface(badInputData)
        )
    })

    repeatIt(5, ok("Input data parse to structure"), (name) => {
        it(name, () => {
            checkStructureBySchema(faker.spec.schema());
        })
    })

    it(ok("One schema, different structures"),() => {
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

    it(err("Input data parse to structure"),() => {
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
