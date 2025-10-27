import {TDatabaseConfig} from "#lib/types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";
import {buildMigrationsLogRepository, TMigrationLogAction} from "#lib/migrationsLogRepository.ts";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const connectionParam = OptionFromNullable(params.connection);

        const connection = connectionParam.match({
            Some: (key) => OkOrNullableAsError(config.connections[key], `Connection "${key}" not exists`),
            None: () => Ok(config.connection),
        })
            .unwrap();

        const migrationsLogRepository = buildMigrationsLogRepository(connection);

        const branch = await OptionFromNullable(params.branch).match({
            Some: async (param) => param as number,
            None: async () => (await migrationsLogRepository.getLastBranch()).unwrap(`Last branch not founded in ${migrationsLogRepository.table} table`)
        });

        output.info("Branch for rollback - " + branch)

        const listMigrations = (await migrationsLogRepository.listRunedByBranch(branch)).unwrap();

        for (const rowMigration of listMigrations) {
            const name = rowMigration.name.unwrap();
            const migration = config.migrations().getByName(name)

            output.success('Down migration - ' + name)

            const sql_source = migration.down();
            await connection.query(sql_source);

            (await migrationsLogRepository.create({
                name,
                branch,
                action: TMigrationLogAction.down,
                sql_source,
            })).unwrap()
        }
    }
}