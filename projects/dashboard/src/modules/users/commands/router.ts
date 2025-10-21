import {CreateConsoleRouter} from "@smuzi/console";
import {createUser} from "#users/commands/create.js";
import {usersInfo} from "#users/commands/info.js";
import {Some} from "@smuzi/std";

export const usersConsole = CreateConsoleRouter('users:');

usersConsole.add({path: 'create', description: Some("createUser")}, createUser)
usersConsole.add('info', usersInfo)