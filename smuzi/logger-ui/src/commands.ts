import { CreateConsoleRouter, TInputParams, TOutputConsole } from "@smuzi/console";
import { Err, Ok, Result, Some } from "@smuzi/std";
import { generatePassword, hashPassword } from "./password.js";
import { LoggerUiUsersRepository, normalizeEmail } from "./users.js";

export function parseUserEmail(value: string): Result<string, string> {
    const email = normalizeEmail(value);
    if (email === "") {
        return Err("Argument --email is required, e.g. --email=admin@example.com");
    }

    const at = email.indexOf("@");
    if (at <= 0 || at === email.length - 1) {
        return Err(`'${email}' is not an email: expected <name>@<domain>`);
    }

    return Ok(email);
}

export function createUserCommand(users: LoggerUiUsersRepository) {
    return async (output: TOutputConsole, params: TInputParams) => {
        const email = parseUserEmail(params.get("email").someOr(""));
        if (email.isErr()) {
            output.error(email.unsafeSource());
            process.exitCode = 1;
            return;
        }

        const existing = (await users.findByEmail(email.unwrap())).unwrap();
        if (existing.isSome()) {
            output.error(`User '${email.unwrap()}' already exists`);
            process.exitCode = 1;
            return;
        }

        const password = generatePassword();
        const user = (await users.create(email.unwrap(), await hashPassword(password))).unwrap();

        output.success(`Logger UI user created: ${user.email}`);
        output.info("Password (shown only once):");
        output.bold(password);
    };
}

export function resetPasswordCommand(users: LoggerUiUsersRepository) {
    return async (output: TOutputConsole, params: TInputParams) => {
        const email = parseUserEmail(params.get("email").someOr(""));
        if (email.isErr()) {
            output.error(email.unsafeSource());
            process.exitCode = 1;
            return;
        }

        const password = generatePassword();
        // Updates only this one row by email; never affects any other user.
        const updated = (await users.updatePasswordByEmail(email.unwrap(), await hashPassword(password))).unwrap();
        if (updated.isNone()) {
            output.error(`User '${email.unwrap()}' does not exist`);
            process.exitCode = 1;
            return;
        }

        output.success(`Logger UI user password reset: ${updated.unwrap().email}`);
        output.info("New password (shown only once):");
        output.bold(password);
    };
}

// Usage: <prefix>users:create --email=admin@example.com
// Usage: <prefix>users:reset-password --email=admin@example.com
export const loggerUiConsole = (users: LoggerUiUsersRepository, prefix_command = "logger-ui:") => {
    const router = CreateConsoleRouter(prefix_command);
    const router_users = CreateConsoleRouter("users:");

    router_users.add(
        { path: "create", description: Some("Create logger UI user and print generated password: --email=<email>") },
        createUserCommand(users)
    );
    router_users.add(
        { path: "reset-password", description: Some("Generate and set a new password for an existing user, print it: --email=<email>") },
        resetPasswordCommand(users)
    );

    router.group(router_users);

    return router;
}
