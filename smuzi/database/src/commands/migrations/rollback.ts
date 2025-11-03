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

        const branch = await OptionFromNullable(params.branch).match({
            Some: async (param) => param as number,
            None: async () => (await migrationsLogRepository.getLastBranch()).unwrap(`Last branch not founded in ${migrationsLogRepository.getTable()} table`)
        });

        output.info("Branch for rollback - " + branch)


        const logMigrations = (await migrationsLogRepository.listRunedByBranch(branch)).unwrap();
        const migrations = service.buildMigrations();

        for (const rowLog of logMigrations) {
            const name = rowLog.name.unwrap();
            const migration = migrations.getByName(name)

            output.success('Down migration - ' + name)

            const sql_source = clearSQL(migration.down());
            (await service.client.query(sql_source)).unwrap();

            (await migrationsLogRepository.create({
                name,
                branch,
                action: TMigrationLogAction.down,
                sql_source,
            })).unwrap()
        }
    }
}