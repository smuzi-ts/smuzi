import {TDatabaseService} from "../../types.js";
import {TOutputConsole} from "@smuzi/console";
import run from "./run.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";

export default function (service: TDatabaseService) {
    return async (output: TOutputConsole, params) => {

        output.success('Drop all tables...');

        (await service.buildMigrationLogRepository(service.client).freshSchema()).unwrap()

        await run(service)(output, params);
    }
}