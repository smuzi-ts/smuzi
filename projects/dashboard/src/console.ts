import "./globals.js";
import * as process from "node:process";

import { consoleConfig } from "#configs/console.js";
import { commandHandler } from "@smuzi/console";

await commandHandler(process.argv, consoleConfig);
