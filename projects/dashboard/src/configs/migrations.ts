import { Migrator } from "@smuzi/database";
import usersTable from "#lib/modules/users/database/migrations/usersTable.ts";

const migrator = Migrator();
migrator.add(usersTable);

export const migrationsConfig = {
    migrator
};

