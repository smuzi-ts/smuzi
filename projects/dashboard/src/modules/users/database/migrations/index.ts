import {Migrations} from "@smuzi/database";
import createUsersTable from "#users/database/migrations/createUsersTable.js";

export const usersMigrations = Migrations('users:');
usersMigrations.add('create_users_table', createUsersTable)
