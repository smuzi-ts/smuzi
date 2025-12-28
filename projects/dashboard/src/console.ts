import * as process from "node:process";

import { consoleConfig } from "#configs/console.js";
import { commandHandler } from "@smuzi/console";
import {main} from "@smuzi/std";

main(async () => {
    await commandHandler(process.argv, consoleConfig);
})
