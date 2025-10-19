import { Migrator } from "@smuzi/database";
import usersTable from "#lib/modules/users/database/migrations/usersTable.ts";

export const migrations = Migrator();

migrations.add(usersTable);