import {CreateConsoleRouter, SystemInputParser} from "@smuzi/console";
import {usersConsole} from "#lib/modules/users/commands/router.js";

const router = CreateConsoleRouter({path: ''});
router.group(usersConsole);

export const consoleConfig = {
    inputParser: SystemInputParser,
    router,
}
