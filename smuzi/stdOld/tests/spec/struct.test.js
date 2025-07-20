import {
    Struct,
    STRUCT_NAME_FIELD,
    TYPE_STRUCT_INSTANCE,
    TYPE_NAME_FIELD,
    S,
    StructValidationException
} from "#lib/spec.js";
import {isStructInstance} from "#lib/utils.js";
import {faker} from "@smuzi/faker";
import {assert, describe, it, repeatIt, skip, ok, err} from "@smuzi/tests";

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
        const structName = faker.string({max: 5, suffix: "Struct"});
        const StructInterface = Struct(structName, {
            field1: S.array(),
        });

        const badInputData = {
            field1: "stringInsteadOfArray",
        };

        const expectedErrorMeta = {
            structName: structName,
            err: { field1: { expected: "array", actual: 'string' } }
        };

        assert.expectErrorWithMeta(
            expectedErrorMeta,
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

        const structName = faker.string({max: 5, suffix: "Struct"});
        const StructInterface = Struct(structName, schema);

        const badInputData = {
            field1: faker.integer(),
            field2: faker.string(),
            field3: faker.integer(),
        };

        assert.expectErrorInstOf(
            (err) => err instanceof StructValidationException,
            () => StructInterface(badInputData)
        )

        const expectedErrorMeta = {
            structName: structName,
            err: {
                field1: { expected: "string", actual: 'number' },
                field2: { expected: "integer", actual: 'string' },
                field3: { expected: "boolean", actual: 'number' },
            }
        };

        assert.expectErrorWithMeta(
            expectedErrorMeta,
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
