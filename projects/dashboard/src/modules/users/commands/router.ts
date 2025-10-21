import {CreateConsoleRouter} from "@smuzi/console";
import {createUser} from "#users/commands/create.js";
import {usersInfo} from "#users/commands/info.js";

export const usersConsole = CreateConsoleRouter('users:');

usersConsole.add('create', createUser)
usersConsole.add('info', usersInfo)