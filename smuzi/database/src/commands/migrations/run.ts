import {TDatabaseService} from "../../types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";
import {clearSQL} from "../../helpers.js";
import {TMigrationLogAction} from "../../migration.js";

export default function (service: TDatabaseService) {
    return async (output: TOutputConsole, params) => {

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

            (await service.client.query(sql_source)).unwrap();

           (await migrationsLogRepository.create({
                name,
                branch,
                action: TMigrationLogAction.up,
                sql_source,
                created_at: new Date(),
            })).unwrap();
        }
    }
}