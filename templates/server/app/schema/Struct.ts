import {validation} from "#app/schema/types";

export const Struct =
    (schema: {}) =>
        <S extends Object>(obj: S): [{},Readonly<S>] =>
        {
            return [validation(schema, obj), Object.freeze(obj)];
        };

export const MutStruct =
    (schema: {}) =>
        <S extends Object>(obj: S): [{},S] =>
        {
            return [validation(schema, obj), obj];
        };