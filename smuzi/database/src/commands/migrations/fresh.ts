import {TDatabaseConfig} from "#lib/types.js";
import {TOutputConsole} from "@smuzi/console";
import run from "#lib/commands/migrations/run.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const service = OptionFromNullable(params.service).match({
            Some: (key) => OkOrNullableAsError(config.services[key], `Service "${key}" not exists`),
            None: () => Ok(config.current),
        })
            .unwrap();

        output.success('Drop all tables...');

        (await service.buildMigrationLogRepository(service.client).freshSchema()).unwrap()

        await run(config)(output, params);
    }
}