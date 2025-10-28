import {Migrations} from "@smuzi/database";
import createUsersTable from "#users/database/migrations/createUsersTable.ts";

export const usersMigrations = Migrations('users:');
usersMigrations.add('create_users_table', createUsersTable)
