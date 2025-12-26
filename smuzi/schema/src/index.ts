import {datetime} from "#lib/datetime.js";
import {storage} from "#lib/storage.js";
import {SchemaNumber, SchemaString} from "#lib/primitive.js";
import {SchemaObjConfig, SchemaObject} from "#lib/obj.js";
import {SchemaRule as _SchemaRule} from "#lib/types.js";
import {SchemaRecord, SchemaRecordConfig} from "#lib/record.js";
import {SchemaMapConfig, SchemaMap} from "#lib/map.js";
import {SchemaListConfig, SchemaList} from "#lib/list.js";
import {SchemaOption, SchemaOptionConfig} from "#lib/option.js";
export {SchemaNativeDate} from "#lib/datetime.js";
export {type SchemaValidationError} from "#lib/types.js";
export {SchemaObject} from "#lib/obj.js";
export {SchemaOption} from "#lib/option.js";
export {SchemaStorageAutoNumber} from "#lib/storage.js";
export {SchemaNumber, SchemaString} from "#lib/primitive.js";

export type SchemaRule = _SchemaRule;

export const schema = {
    option: <C extends SchemaOptionConfig>(config: C) => (new SchemaOption(config)),
    number: (msg: string = "Expected number") => (new SchemaNumber(msg)),
    string: (msg: string = "Expected string") => (new SchemaString(msg)),
    obj: <C extends SchemaObjConfig>(config: C) => new SchemaObject<C>(config),
    record: <C extends SchemaRecordConfig>(config: C) => new SchemaRecord<C>(config),
    map: <K extends SchemaRule, C extends SchemaMapConfig>(key: K, config: C) => (new SchemaMap<K, C>(key, config)),
    list: <C extends SchemaListConfig>(config: C) => (new SchemaList<C>(config)),
    datetime,
    storage,
}
