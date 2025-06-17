export * from "./syntax/fails.ts";
export * from "./syntax/obj.js";
export * from "./syntax/match.js";
export * from "./dataTypes/result.ts";
export {Exception} from "./errors/exception.js";
import {initPrepareStackTrace} from "./errors/exception.js";

initPrepareStackTrace();