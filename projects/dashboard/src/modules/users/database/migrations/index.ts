import {Migrations} from "@smuzi/database";
import createUsersTable from "#users/database/migrations/createUsersTable.ts";
import createUsersRolesTable from "#users/database/migrations/createUsersRolesTable.ts";
import createUsersPermissionsTable from "#users/database/migrations/createUsersPermissionsTable.ts";

export const usersMigrations = Migrations('users:');
usersMigrations.add('create_users_table', createUsersTable)
usersMigrations.add('create_users_roles_table', createUsersRolesTable)
usersMigrations.add('create_users_permissions_table', createUsersPermissionsTable)
