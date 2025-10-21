import {CreateConsoleRouter, SystemInputParser} from "@smuzi/console";
import {usersConsole} from "#users/commands/router.ts";

const router = CreateConsoleRouter();
router.group(usersConsole);

export const consoleConfig = {
    inputParser: SystemInputParser,
    router,
}
