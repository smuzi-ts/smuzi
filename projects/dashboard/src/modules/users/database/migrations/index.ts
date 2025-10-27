import {Migrations} from "@smuzi/database";
import createUsersTable from "#users/database/migrations/createUsersTable.ts";
import createUsersPermissionsTable from "#users/database/migrations/createUsersPermissionsTable.ts";

export const usersMigrations = Migrations('users:');
usersMigrations.add('create_users_table', createUsersTable)
usersMigrations.add('create_users_permissions_table', createUsersPermissionsTable)
