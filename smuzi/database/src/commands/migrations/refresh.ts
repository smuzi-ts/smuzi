import {TDatabaseConfig} from "#lib/types.js";
import {TOutputConsole} from "@smuzi/console";
import rollback from "#lib/commands/migrations/rollback.ts";
import run from "#lib/commands/migrations/run.ts";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {buildMigrationsLogRepository, TMigrationLogAction} from "#lib/migrationsLogRepository.ts";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const service = OptionFromNullable(params.service).match({
            Some: (key) => OkOrNullableAsError(config.services[key], `Service "${key}" not exists`),
            None: () => Ok(config.current),
        })
            .unwrap();

        const migrationsLogRepository = buildMigrationsLogRepository(service.client);

        const sortedLogMigrations = (await migrationsLogRepository.listRuned()).unwrap();
        const migrations = service.migrations();

        for (const rowLog of sortedLogMigrations) {
            const name = rowLog.name.unwrap();
            const migration = migrations.getByName(name)

            output.success('Down migration - ' + name)

            const sql_source = migration.down();
            await service.client.query(sql_source);

            (await migrationsLogRepository.create({
                name,
                branch: rowLog.branch.unwrap(),
                action: TMigrationLogAction.down,
                sql_source,
            })).unwrap()
        }

        const branch = (await migrationsLogRepository.getLastBranch())
            .match({
                Some: value => ++value,
                None: () => 1
            })

        for (const [name, migration] of migrations.getList()) {
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