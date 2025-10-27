import {TDatabaseConfig, TMigrationLogAction} from "#lib/types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";
import {clearSQL} from "#lib/helpers.ts";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const service = OptionFromNullable(params.service).match({
            Some: (key) => OkOrNullableAsError(config.services[key], `Service "${key}" not exists`),
            None: () => Ok(config.current),
        })
            .unwrap();

        const migrationsLogRepository = service.buildMigrationLogRepository(service.client);

        (await migrationsLogRepository.createTableIfNotExists()).unwrap();

        const branch = (await migrationsLogRepository.getLastBranch())
            .match({
                Some: value => ++value,
                None: () => 1
            })

        for (const [name, migration] of service.buildMigrations().getList()) {
            if (await migrationsLogRepository.migrationWillBeRuned(name)) {
                continue;
            }

            output.success('Run migration - ' + name)

            const sql_source = clearSQL(migration.up());
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