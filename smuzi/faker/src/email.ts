import {isEmpty, panic} from "@smuzi/std";

const NICKNAME_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const DOMAIN_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const DOMAIN_TLDS = ['com', 'net', 'org', 'io', 'dev'];

function randomString(length: number, chars: string): string {
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
}

export function email({min = 5, max = 10, prefix = '', suffix = '', domain = ''} = {}): string {
    if (min > max) panic('min must be less than or equal to max');

    const targetLength = Math.floor(Math.random() * (max - min + 1)) + min;

    let domainPart = domain;

    if (isEmpty(domainPart)) {
        const tld = DOMAIN_TLDS[Math.floor(Math.random() * DOMAIN_TLDS.length)];
        const nameBudget = targetLength - prefix.length - suffix.length - 2 - tld.length; // '@' + '.'
        const nameLength = Math.max(1, Math.min(nameBudget, 8));

        domainPart = randomString(nameLength, DOMAIN_CHARS) + '.' + tld;
    }

    const fixedLength = prefix.length + suffix.length + 1 + domainPart.length;
    const minNicknameLength = isEmpty(prefix) && isEmpty(suffix) ? 1 : 0;
    const nicknameRandomLength = Math.max(minNicknameLength, targetLength - fixedLength);

    return prefix + randomString(nicknameRandomLength, NICKNAME_CHARS) + suffix + '@' + domainPart;
}