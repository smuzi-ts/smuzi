import { StdError } from "./error.js";
import {OptionFromNullable, Some} from "#lib/option.js";

export function panic(err: string | StdError): never {
    const e = new Error();
    throw err instanceof StdError ? err : new StdError("", '!!!PANIC!!!' + err, OptionFromNullable(e.stack));
}