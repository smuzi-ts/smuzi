import {TDatabaseService } from "#lib/types.js";
import {TOutputConsole} from "@smuzi/console";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {clearSQL} from "#lib/helpers.js";
import {TMigrationLogAction} from "#lib/migration.js";

export default function (service: TDatabaseService) {
    return async (output: TOutputConsole, params) => {
        const migrationsLogRepository = service.buildMigrationLogRepository(service.client);

        const sortedLogMigrations = (await migrationsLogRepository.listRuned()).unwrap();
        const migrations = service.buildMigrations();

        if (sortedLogMigrations.rowCount.isZero()) {
            return;
        }

        for (const [key, rowLog] of sortedLogMigrations.rows) {
            const name = rowLog.get("name").unwrap();
            const migration = migrations.getByName(name)

            output.success('Down migration - ' + name)

            const sql_source = clearSQL(migration.down());
            (await service.client.query(sql_source)).unwrap();

            (await migrationsLogRepository.create({
                name,
                branch: rowLog.get("branch").unwrap(),
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