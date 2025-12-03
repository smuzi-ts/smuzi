import { StdError } from "./error.js";

export function panic(err: string | StdError): never {
    throw err instanceof StdError ? err : new StdError("", '!!!PANIC!!!' + err);
}