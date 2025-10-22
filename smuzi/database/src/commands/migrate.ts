import {TDatabaseConfig} from "#lib/config.js";

export const migrate = (config: TDatabaseConfig) => (params)=>  {
    console.log('migrations', config.migrations.getList());
}