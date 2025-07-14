import {
    Struct,
    STRUCT_NAME_FIELD,
    TYPE_STRUCT_INSTANCE,
    TYPE_NAME_FIELD,
    StructValidationException
} from "#lib/spec.js";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt, skip} from "@jis/tests";

describe("Spec-StructDeep", () => {
    repeatIt(2,"Structure with One-level nesting", (name) => {
        it(name, () => {
            const parentSchema = faker.spec.schema();
            const childSchema = faker.spec.schema();
            const unionSchema = Object.assign({child: childSchema}, parentSchema);

            const ChildStruct = Struct('ChildStruct', childSchema);
            const ParentStruct = Struct('ParentStruct', Object.assign(
                    {child: ChildStruct},
                    parentSchema,
                )
            );

            const inputData = faker.spec.objBySchema(unionSchema);
            const resultInstance = ParentStruct(inputData);

            assert.isStructInstance(resultInstance, ParentStruct)

            inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
            inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];
            assert.deepEqual(resultInstance, inputData)
        })
    })

    repeatIt(2,"Structure with Two-level nesting", (name) => {
        it(name, () => {
            const parentSchema = faker.spec.schema();
            const childSchema1 = faker.spec.schema();
            const childSchema2 = faker.spec.schema();

            const unionSchema = Object.assign({child1: Object.assign({child2: childSchema2}, childSchema1)}, parentSchema);

            const ChildStruct2 = Struct('ChildStruct2', childSchema2);
            const ChildStruct1 = Struct('ChildStruct1', Object.assign({child2: ChildStruct2}, childSchema1));

            const ParentStruct = Struct('ParentStruct', Object.assign({child1: ChildStruct1}, parentSchema));

            const inputData = faker.spec.objBySchema(unionSchema);
            inputData.badParam = 'INVALID';

            const resultInstance = ParentStruct(inputData);

            assert.isStructInstance(resultInstance, ParentStruct)

            inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
            inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];

            assert.deepEqual(resultInstance, inputData)
        })
    })

    skip("Structure with Two-level nesting with INVALID input data", () => {
        const parentSchema = faker.spec.schema({maxFields: 1});
        const childSchema1 = faker.spec.schema({maxFields: 1});
        const childSchema2 = faker.spec.schema({maxFields: 1});

        const unionSchema = Object.assign(
            {child1: Object.assign({child2: childSchema2}, childSchema1)},
            parentSchema
        );

        const ChildStruct2 = Struct('ChildStruct2', childSchema2);
        const ChildStruct1 = Struct('ChildStruct1', Object.assign({child2: ChildStruct2}, childSchema1));

        const ParentStruct = Struct('ParentStruct', Object.assign({child1: ChildStruct1}, parentSchema));

        const inputData = faker.spec.objBySchema(unionSchema);
        inputData.BAD_PARAM = 'INVALID';

        assert.expectErrorInstOf(
            err => err instanceof StructValidationException,
            () => ParentStruct(inputData)
        )
    })
})