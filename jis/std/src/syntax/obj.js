export function getClass(obj) {
    return obj?.constructor.name;
}
export const readonly = Object.freeze;
export const clone = (obj) => Object.assign({}, obj);