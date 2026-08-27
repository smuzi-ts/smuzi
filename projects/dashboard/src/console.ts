import * as process from "node:process";

import { consoleConfig } from "#configs/console.js";
import { commandHandler } from "@smuzi/console";
import {mainAndExit, Some} from "@smuzi/std";

mainAndExit(async () => {
    await commandHandler(process.argv, consoleConfig);
})
