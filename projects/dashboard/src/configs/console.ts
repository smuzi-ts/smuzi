import {ConsoleConfig, CreateConsoleRouter, StandardOutput, StandardThema, SystemInputParser} from "@smuzi/console";
import {databaseConsole} from "@smuzi/database";
import {databaseConfig} from "#configs/database.js";


const router = CreateConsoleRouter();
router.group(databaseConsole(databaseConfig.default));

export const consoleConfig = ConsoleConfig({
    inputParser: SystemInputParser,
    router,
    output: StandardOutput(StandardThema),
});
