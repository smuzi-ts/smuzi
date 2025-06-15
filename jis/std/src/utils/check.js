export function isNone(val) {
    return val === undefined || val === null;
}

export function isEmpty(val) {
    return isNone(val) || val === "" || (Array.isArray(val) && val.length === 0);
}

export function isString(val) {
    return typeof val === "string";
}

export function isBool(val) {
    return typeof val === "boolean";
}

export function isInteger(val) {
    return Number.isInteger(val);
}