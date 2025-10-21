import {DatabaseConfig, Migrations} from "@smuzi/database";
import usersTable from "#users/database/migrations/usersTable.ts";

const migrations = Migrations();
migrations.add(usersTable);

export const databaseConfig = new DatabaseConfig({
    migrations,
});

