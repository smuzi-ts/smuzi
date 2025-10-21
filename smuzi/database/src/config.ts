import {Struct} from "@smuzi/std";
import {TMigrations} from "#lib/migration.ts";

export type TDatabaseConfig = {
    migrations: TMigrations,
};

export const DatabaseConfig = Struct<TDatabaseConfig>();
