import {
    Err,
    Ok,
    Result,
    asMap,
    asObject,
    asRecord,
    isNull,
    StdRecord,
    Simplify,
    StdMap,
    StdList,
    asList, dump
} from "@smuzi/std";
import {datetime} from "#lib/datetime.js";
import {faker} from "@smuzi/faker";
import {storage} from "#lib/storage.js";
import {SchemaNumber, SchemaString} from "#lib/primitive.js";
import {SchemaObject} from "#lib/obj.js";
import {SchemaConfig, SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaRecord} from "#lib/record.js";
import {SchemaMap} from "#lib/map.js";
import {SchemaConfigList, SchemaList} from "#lib/list.js";
export {SchemaNativeDate} from "#lib/datetime.js";

class SchemaConfigMap {
}

export const schema = {
    number: (msg = "Expected number") => (new SchemaNumber(msg)),
    string: (msg = "Expected string") => (new SchemaString(msg)),
    obj: <C extends SchemaConfig>(config: C) => new SchemaObject<C>(config),
    record: <C extends SchemaConfig>(config: C) => new SchemaRecord<C>(config),
    map: <K extends SchemaRule, C extends SchemaConfigMap>(key: K, config: C) => (new SchemaMap<K, C>(key, config)),
    list: <C extends SchemaConfigList>(config: C) => (new SchemaList<C>(config)),
    datetime,
    storage,
}
