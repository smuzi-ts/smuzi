import {TYPE_NAME_FIELD} from "#lib/spec/schema.ts";

export const TYPE_ENUM = Symbol("Enum");
export const ENUM_FIELD_UID = Symbol("ENUM_FIELD_UID");
const ENUM_MAP = Symbol("ENUM_MAP");

const Enum = (options) => {
    const newOptions = {
        [ENUM_MAP]: new Map(),
        [TYPE_NAME_FIELD]: TYPE_ENUM,
    };

    for (const optionName in options) {
        if (typeof options[optionName] === 'function') {
            const uid = Symbol(optionName)
            newOptions[optionName] = (...args) => {
                return Object.assign({[ENUM_FIELD_UID]: uid}, options[optionName](args))
            }
            newOptions[optionName][ENUM_FIELD_UID] = uid;
        }
    }

    return newOptions;
}