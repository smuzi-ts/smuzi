import { randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const GENERATED_PASSWORD_LENGTH = 24;

function scryptKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, SCRYPT_KEY_LENGTH, (error, key) => error ? reject(error) : resolve(key));
    });
}

// Alphanumeric without look-alike characters, so it is easy to copy from the terminal.
export function generatePassword(length: number = GENERATED_PASSWORD_LENGTH): string {
    let password = "";
    for (let index = 0; index < length; index++) {
        password += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
    }

    return password;
}

// Stored as "scrypt$<salt>$<key>", both base64url.
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SCRYPT_SALT_LENGTH);
    const key = await scryptKey(password, salt);

    return ["scrypt", salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, password_hash: string): Promise<boolean> {
    const [algorithm, salt, key] = password_hash.split("$");
    if (algorithm !== "scrypt" || salt === undefined || key === undefined) {
        return false;
    }

    const expected = Buffer.from(key, "base64url");
    const actual = await scryptKey(password, Buffer.from(salt, "base64url"));

    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
