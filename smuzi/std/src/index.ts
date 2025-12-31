export * from "./checker.js";
export * from "./option.js";
export * from "./result.js";
export * from "./match.js";
export * from "./pipeline.js";
export * from "./panic.js";
export * from "./debug.js";
export * from "./common.js";
export * from "./dotEnv.js";
export * from "./object.js";
export * from "./promise.js";
export * from "./json.js";
export * from "./utilTypes.js";
export * from "./path.js";
export * from "./http.js";
export * from "./error.js";
export * from "./record.js";
export * from "./map.js";
export * from "./list.js";
export * from "./common.js";
export * from "./uuid.js";
export * from "./regexp.js";

import * as _scripts from "./scripts.js";
export const scripts = _scripts;

export async function main(program: () => unknown) {
    try {
        await program();
    } catch (e) {
        console.log(e);
    }
    process.exit();
}