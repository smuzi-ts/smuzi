import {TDatabaseService} from "#lib/types.js";
import {readonly} from "@smuzi/std";

export function DatabaseConfig(config: TDatabaseService) {
    return readonly(config);
}
