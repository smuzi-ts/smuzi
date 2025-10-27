import {TDatabaseConfig} from "#lib/types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";
import {buildMigrationsLogRepository, TMigrationLogAction} from "#lib/migrationsLogRepository.ts";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const service = OptionFromNullable(params.service).match({
            Some: (key) => OkOrNullableAsError(config.services[key], `Service "${key}" not exists`),
            None: () => Ok(config.current),
        })
            .unwrap();

        const migrationsLogRepository = buildMigrationsLogRepository(service.client);

        (await migrationsLogRepository.createTableIfNotExists()).unwrap();

        const branch = (await migrationsLogRepository.getLastBranch())
            .match({
                Some: value => ++value,
                None: () => 1
            })

        for (const [name, migration] of service.migrations().getList()) {
            if (await migrationsLogRepository.migrationWillBeRuned(name)) {
                continue;
            }

            output.success('Run migration - ' + name)

            const sql_source = migration.up();
            await service.client.query(sql_source);

            await migrationsLogRepository.create({
                name,
                branch,
                action: TMigrationLogAction.up,
                sql_source,
            })
        }
    }
}