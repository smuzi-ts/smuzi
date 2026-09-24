import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Err, HttpRequest, None, Ok, Option, Result, Some, StdError } from "@smuzi/std";
import { generatePassword, hashPassword, verifyPassword } from "./password.js";
import { LoggerUiUser, LoggerUiUsersRepository } from "./users.js";

export const LOGGER_UI_SESSION_COOKIE = "logger_ui_session";
export const LOGGER_UI_SESSION_DEFAULT_TTL_SECONDS = 60 * 60 * 12;

export type LoggerUiAuthOptions = {
    // HMAC key for session cookies. When omitted a random one is generated,
    // so sessions do not survive a restart and are not shared between instances.
    session_secret?: string,
    session_ttl_seconds?: number,
    // Adds the Secure flag to the session cookie (use when served over HTTPS).
    secure_cookie?: boolean,
}

function readCookie(request: HttpRequest, name: string): Option<string> {
    const header = request.headers.get("cookie").someOr("");

    for (const part of header.split(";")) {
        const separator = part.indexOf("=");
        if (separator !== -1 && part.slice(0, separator).trim() === name) {
            return Some(decodeURIComponent(part.slice(separator + 1).trim()));
        }
    }

    return None();
}

function safeEqual(left: string, right: string): boolean {
    const left_buffer = Buffer.from(left);
    const right_buffer = Buffer.from(right);

    return left_buffer.length === right_buffer.length && timingSafeEqual(left_buffer, right_buffer);
}

export class LoggerUiAuth {
    #users: LoggerUiUsersRepository;
    #secret: Buffer;
    #ttl_seconds: number;
    #secure_cookie: boolean;
    #dummy_hash: Promise<string> | null = null;

    constructor(
        users: LoggerUiUsersRepository,
        { session_secret, session_ttl_seconds = LOGGER_UI_SESSION_DEFAULT_TTL_SECONDS, secure_cookie = false }: LoggerUiAuthOptions = {}
    ) {
        this.#users = users;
        this.#secret = session_secret !== undefined && session_secret !== ""
            ? Buffer.from(session_secret)
            : randomBytes(32);
        this.#ttl_seconds = session_ttl_seconds;
        this.#secure_cookie = secure_cookie;
    }

    // The password hash is part of the signature, so a changed password invalidates old sessions.
    #sign(payload: string, user: LoggerUiUser): string {
        return createHmac("sha256", this.#secret)
            .update(payload + "." + user.password_hash)
            .digest("base64url");
    }

    #createToken(user: LoggerUiUser): string {
        const expires_at = Math.floor(Date.now() / 1000) + this.#ttl_seconds;
        const payload = user.id + "." + expires_at;

        return payload + "." + this.#sign(payload, user);
    }

    // Hashing against a throwaway hash keeps response time the same for unknown emails.
    #dummyHash(): Promise<string> {
        this.#dummy_hash ??= hashPassword(generatePassword());

        return this.#dummy_hash;
    }

    // Returns the session token on valid credentials.
    async login(email: string, password: string): Promise<Result<Option<string>, StdError>> {
        const found = await this.#users.findByEmail(email);
        if (found.isErr()) {
            return Err(found.unsafeSource());
        }

        const user = found.unwrap();
        if (user.isNone()) {
            await verifyPassword(password, await this.#dummyHash());
            return Ok(None());
        }

        const valid = await verifyPassword(password, user.unwrap().password_hash);

        return Ok(valid ? Some(this.#createToken(user.unwrap())) : None());
    }

    async authenticate(request: HttpRequest): Promise<Result<Option<LoggerUiUser>, StdError>> {
        const token = readCookie(request, LOGGER_UI_SESSION_COOKIE);
        if (token.isNone()) {
            return Ok(None());
        }

        const [id, expires_at, signature] = token.unwrap().split(".");
        const user_id = Number(id);
        if (!Number.isInteger(user_id) || signature === undefined || Number(expires_at) < Date.now() / 1000) {
            return Ok(None());
        }

        const found = await this.#users.findById(user_id);
        if (found.isErr()) {
            return found;
        }

        const user = found.unwrap();
        if (user.isNone() || !safeEqual(signature, this.#sign(id + "." + expires_at, user.unwrap()))) {
            return Ok(None());
        }

        return Ok(user);
    }

    #cookie(value: string, path: string, max_age: number): string {
        const attributes = [
            `${LOGGER_UI_SESSION_COOKIE}=${encodeURIComponent(value)}`,
            `Path=${path === "" ? "/" : path}`,
            `Max-Age=${max_age}`,
            "HttpOnly",
            "SameSite=Strict",
        ];
        if (this.#secure_cookie) {
            attributes.push("Secure");
        }

        return attributes.join("; ");
    }

    sessionCookie(token: string, path: string): string {
        return this.#cookie(token, path, this.#ttl_seconds);
    }

    clearSessionCookie(path: string): string {
        return this.#cookie("", path, 0);
    }
}
