import {ENUM_FIELD_UID} from "#lib/spec/enum.ts";

const defaultHandlerUnmatched = (real) => {
    throw new Error('Unmatched value')
}

export const match = (value, handlers, defaultHandler = defaultHandlerUnmatched) => {
    for (const handler of handlers) {

        if (handler[0] === value || (handler[0].hasOwnProperty(ENUM_FIELD_UID) ? handler[0][ENUM_FIELD_UID] === value[ENUM_FIELD_UID] : false)) {
            defaultHandler = handler[1];
            return defaultHandler(value);
        }
    }

    return defaultHandler(value);
}
