import {isEmpty} from "@smuzi/std";

export function string({min = 5, max = 10, prefix = '', suffix = ''} = {}) {
    if (min > max) throw new Error('min must be less than or equal to max');
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const result = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    return (isEmpty(prefix) ? prefix : '') + result + (isEmpty(suffix) ? suffix : '');
}

export function boolean() {
    return Math.random() < 0.5;
}

export function integer(min = 0, max = 100) {
    if (min > max) throw new Error('min must be less than or equal to max');
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function float(min = 0, max = 100, decimals = 2) {
    if (min > max) throw new Error('min must be less than or equal to max');
    const factor = 10 ** decimals;
    const raw = Math.random() * (max - min) + min;
    return Math.round(raw * factor) / factor;
}

export function number(min = 0, max = 100, decimals = 2) {
    return float(min, max, decimals);
}