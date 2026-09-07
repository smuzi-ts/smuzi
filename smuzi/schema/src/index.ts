import {datetime} from "./datetime.js";
import {_enum} from "./_enum.js";
import {storage} from "./storage.js";
import {SchemaBoolean, SchemaNumber, SchemaString} from "./primitive.js";
import {SchemaObjConfig, SchemaObject} from "./obj.js";
import {SchemaRule as _SchemaRule} from "./types.js";
import {SchemaRecord, SchemaRecordConfig} from "./record.js";
import {SchemaMapConfig, SchemaMap} from "./map.js";
import {SchemaListConfig, SchemaList} from "./list.js";
import {SchemaOption, SchemaOptionConfig} from "./option.js";
export {SchemaNativeDate, SchemaTemporalDateTimeDate} from "./datetime.js";
export {type SchemaValidationError} from "./types.js";
export {SchemaObject} from "./obj.js";
export {SchemaOption} from "./option.js";
export {SchemaEnumStrings} from "./_enum.js";
export {SchemaStorageAutoNumber} from "./storage.js";
export { SchemaRecord } from "./record.js";
export { SchemaList } from "./list.js";

export {SchemaNumber, SchemaString, SchemaBoolean} from "./primitive.js";

export type SchemaRule = _SchemaRule;

export const schema = {
    option: <C extends SchemaOptionConfig>(config: C) => (new SchemaOption(config)),
    boolean: (msg: string = "Expected boolean") => (new SchemaBoolean(msg)),
    number: (msg: string = "Expected number") => (new SchemaNumber(msg)),
    string: (msg: string = "Expected string") => (new SchemaString(msg)),
    obj: <C extends SchemaObjConfig>(config: C) => new SchemaObject<C>(config),
    record: <C extends SchemaRecordConfig>(config: C) => new SchemaRecord<C>(config),
    map: <K extends SchemaRule, C extends SchemaMapConfig>(key: K, config: C) => (new SchemaMap<K, C>(key, config)),
    list: <C extends SchemaListConfig>(config: C) => (new SchemaList<C>(config)),
    datetime,
    storage,
    enum: _enum,
}
