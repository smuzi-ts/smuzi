import {isStructInstance, Struct, STRUCT_NAME_FIELD, TYPE_STRUCT_INSTANCE} from "#lib/dataTypes/Struct.ts";
import {S, TYPE_NAME_FIELD} from "#lib/Types.ts";
import {faker} from "@jis/faker";
import {assert, describe, it, repeatIt} from "@jis/tests";
import _assert from "node:assert/strict";

describe("Spec-StructDeep", () => {
    repeatIt(2,"Structure with One-level nesting", (name) => {
        it(name, () => {
            const parentSchema = faker.spec.schema(5);
            const childSchema = faker.spec.schema(5);
            const unionSchema = Object.assign({child: childSchema}, parentSchema);

            const ChildStruct = Struct(childSchema, 'ChildStruct');
            const ParentStruct = Struct(Object.assign(
                    {child: ChildStruct},
                    parentSchema,
                ),
                'ParentStruct');

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
            const parentSchema = faker.spec.schema(5);
            const childSchema1 = faker.spec.schema(5);
            const childSchema2 = faker.spec.schema(5);

            const unionSchema = Object.assign({child1: {childSchema1, child2: childSchema2}}, parentSchema);

            const ChildStruct2 = Struct(childSchema2, 'ChildStruct2');
            const ChildStruct1 = Struct(Object.assign({child2: ChildStruct2}, childSchema1), 'ChildStruct1');

            const ParentStruct = Struct(Object.assign({child1: ChildStruct1}, parentSchema), 'ParentStruct');

            const inputData = faker.spec.objBySchema(unionSchema);
            const resultInstance = ParentStruct(inputData);

            assert.isStructInstance(resultInstance, ParentStruct)

            inputData[TYPE_NAME_FIELD] = TYPE_STRUCT_INSTANCE;
            inputData[STRUCT_NAME_FIELD] = resultInstance[STRUCT_NAME_FIELD];
            assert.deepEqual(resultInstance, inputData)
        })
    })
})