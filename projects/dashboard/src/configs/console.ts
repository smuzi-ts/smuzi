import {ConsoleConfig, CreateConsoleRouter, StandardOutput, StandardThema, SystemInputParser} from "@smuzi/console";
import {usersConsole} from "#users/commands/router.ts";
import {databaseConsole} from "@smuzi/database";
import {databaseConfig} from "#configs/database.js";

const router = CreateConsoleRouter();
router.group(usersConsole);
router.group(databaseConsole(databaseConfig));

export const consoleConfig = new ConsoleConfig({
    inputParser: SystemInputParser,
    router,
    output: StandardOutput(StandardThema),
});
