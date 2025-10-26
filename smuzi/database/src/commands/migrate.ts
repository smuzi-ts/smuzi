import {TDatabaseConfig} from "#lib/types.js";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {TOutputConsole} from "@smuzi/console";

export const migrate = (config: TDatabaseConfig) => async (output: TOutputConsole, params)=>  {
    const connectionParam = OptionFromNullable(params.connection);

    const connection = connectionParam.match({
        Some: (key) => OkOrNullableAsError(config.connections[key],`Connection "${key}" not exists`),
        None: () => Ok(config.connection),
    })
        .unwrap();


    //TODO: create migrations_report table and run only unused migrations
    for (const migration of config.migrations.getList()) {
        output.info('Run migration - ' + migration.name)
        await connection.query(migration.up());
    }
}