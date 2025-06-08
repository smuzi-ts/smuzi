import {STRUCT_ID} from "./Struct.ts";

type AnonymFunc = (...args: any) => any;

export const Func = (...structures) =>
    <FN extends AnonymFunc>(fn: FN) =>
        (...values: Parameters<FN>): ReturnType<FN> => {
            for (const key in values) {
                if (values[key][STRUCT_ID] !== structures[key][STRUCT_ID]) {
                    console.log({value: values[key], structure: structures[key]})
                    throw new Error('Value not matched to structure')
                }
            }

            return fn(...values);
        }

