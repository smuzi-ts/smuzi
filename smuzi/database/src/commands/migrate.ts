import {TDatabaseConfig} from "#lib/types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";
import {buildMigrationsLogRepository} from "#lib/migrationsLogRepository.ts";

export const migrate = (config: TDatabaseConfig) => async (output: TOutputConsole, params)=>  {
    const connectionParam = OptionFromNullable(params.connection);

    const connection = connectionParam.match({
        Some: (key) => OkOrNullableAsError(config.connections[key],`Connection "${key}" not exists`),
        None: () => Ok(config.connection),
    })
        .unwrap();

    const migrationsLogRepository = buildMigrationsLogRepository(connection);

    (await migrationsLogRepository.createTableIfNotExists()).unwrap();

    const branch = (await migrationsLogRepository.getLastBranch())
        .match({
            Some: value => value++,
            None: () => 1
        })

    for (const [name, migration] of config.migrations().getList()) {
        if (await migrationsLogRepository.migrationWillBeRuned(name)) {
            output.warn('Migration will be runed - ' + name)
            continue;
        }

        output.success('Run migration - ' + name)

        const sqlSource = migration.up();
        await connection.query(sqlSource);

        await migrationsLogRepository.create({
            name,
            branch,
            action: 'up',
            sqlSource,
        })
    }
}