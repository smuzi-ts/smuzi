import {TDatabaseService} from "../../types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";
import {clearSQL} from "../../helpers.js";
import {TMigrationLogAction} from "../../migration.js";

export default function (service: TDatabaseService) {
    return async (output: TOutputConsole, params) => {

        const migrationsLogRepository = service.buildMigrationLogRepository(service.client);

        const branch = await params.get("branch").match({
            Some: async (val) => val as number,
            None: async () => (await migrationsLogRepository.getLastBranch()).unwrap(`Last branch not founded in ${migrationsLogRepository.getTable()} table`)
        });

        output.info("Branch for rollback - " + branch)

        const logMigrations = (await migrationsLogRepository.listRunedByBranch(branch)).unwrap();
        const migrations = service.buildMigrations();

       if (logMigrations.rowCount.isZero()) {
            return;
        }
        
        for (const [key, rowLog] of logMigrations.rows) {
            const name = rowLog.get("name").unwrap();

            const migration = migrations.getByName(name)

            output.success('Down migration - ' + name)

            const sql_source = clearSQL(migration.down());
            (await service.client.query(sql_source)).unwrap();

            (await migrationsLogRepository.create({
                name,
                branch,
                action: TMigrationLogAction.down,
                sql_source,
                created_at: new Date(),
            })).unwrap()
        }
    }
}