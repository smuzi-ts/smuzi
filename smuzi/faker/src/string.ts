import {isEmpty, panic} from "@smuzi/std";

export function cyrillic({min = 5, max = 10, prefix = '', suffix = ''} = {}): string {
    if (min > max) panic('min must be less than or equal to max');
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    const chars = 'абвгдеєжзиіїйклмнопрстуфхцчшщьюяАБВГДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ';
    const result = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    return (isEmpty(prefix) ? prefix : '') + result + (isEmpty(suffix) ? suffix : '');
}