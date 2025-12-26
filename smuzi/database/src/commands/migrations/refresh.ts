import {TDatabaseConfig, } from "#lib/types.js";
import {TOutputConsole} from "@smuzi/console";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {clearSQL} from "#lib/helpers.js";
import {TMigrationLogAction} from "#lib/migration.js";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const service = OptionFromNullable(params.service).match({
            Some: (key) => OkOrNullableAsError(config.services[key], `Service "${key}" not exists`),
            None: () => Ok(config.current),
        })
            .unwrap();

        const migrationsLogRepository = service.buildMigrationLogRepository(service.client);

        const sortedLogMigrations = (await migrationsLogRepository.listRuned()).unwrap();
        const migrations = service.buildMigrations();

        for (const [key, rowLog] of sortedLogMigrations) {
            const name = rowLog.name;
            const migration = migrations.getByName(name)

            output.success('Down migration - ' + name)

            const sql_source = clearSQL(migration.down());
            (await service.client.query(sql_source)).unwrap();

            (await migrationsLogRepository.create({
                name,
                branch: rowLog.branch,
                action: TMigrationLogAction.down,
                sql_source,
                created_at: new Date()
            })).unwrap()
        }

        const branch = (await migrationsLogRepository.getLastBranch())
            .match({
                Some: value => ++value,
                None: () => 1
            })

        for (const [name, migration] of migrations.getList()) {
            output.success('Run migration - ' + name)

            const sql_source = clearSQL(migration.up());
            await service.client.query(sql_source);

            await migrationsLogRepository.create({
                name,
                branch,
                action: TMigrationLogAction.up,
                sql_source,
                created_at: new Date()
            })
        }
    }
}