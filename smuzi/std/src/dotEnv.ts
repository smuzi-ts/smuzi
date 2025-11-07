import {None, Option, OptionFromNullable} from "#lib/option.js";

export function env(key: string, defaultValue: Option<string> = None()): string {
    let val = defaultValue;

    if (typeof globalThis.Deno !== 'undefined') {
        val = OptionFromNullable((globalThis as any).Deno.env.get(key));
    }
    // Bun
    else if (typeof globalThis.Bun !== 'undefined') {
        val = OptionFromNullable((globalThis as any).Bun.env[key]);
    }
    // Node.js
    else if (typeof process !== 'undefined') {
        val = OptionFromNullable(process.env[key]);
    }

    return  (val.isNull() ? defaultValue : val).unwrap();
}