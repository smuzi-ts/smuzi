import {STRUCT_NAME_FIELD} from "./Struct.ts";


export const Func =
    (...structures) =>
        <Args extends unknown[], R>(
            fn: (...values: Args) => R,
        ) =>
            (...values: Args): R => {
                for (const key in values) {
                    const realValueType = values?.[key]?.[STRUCT_NAME_FIELD] ?? typeof values[key];
                    const expectedStruct = structures?.[key]?.[STRUCT_NAME_FIELD];
                    if (expectedStruct === undefined) {
                        //TODO add other types via Schema
                        throw new Error(`Type of structures[${key}] expected "Struct", but get "${typeof structures[key]}"`)
                    }
                    if (realValueType !== expectedStruct) {
                        throw new Error(`Type of values[${key}] expected "${expectedStruct.description}", but get "${realValueType}"`)
                    }
                }
                return fn(...values);
            };