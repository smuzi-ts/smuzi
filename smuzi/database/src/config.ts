import {TDatabaseService} from "./types.js";
import {readonly} from "@smuzi/std";

export function DatabaseConfig(config: TDatabaseService) {
    return readonly(config);
}
