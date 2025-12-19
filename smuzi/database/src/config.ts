import {TDatabaseConfig} from "#lib/types.js";
import {readonly} from "@smuzi/std";

export function DatabaseConfig(config: TDatabaseConfig) {
    return readonly(config);
}
