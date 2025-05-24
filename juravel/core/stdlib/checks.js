export function isEmpty(value) {
    return value === null || value === undefined || value === '' || value === 'undefined' || (isArray(value) && value.length == 0);
}

export function isString(value) {
    return typeof value === "string";
}

export function isNumber(value) {
    return typeof value === "number";
}

export function isArray(value) {
    return Array.isArray(value);
}

export function isFunction(value) {
    return typeof value === 'function';
}
