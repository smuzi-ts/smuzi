import "./globals.js";
import {consoleConfig} from "#configs/console.js";
import * as process from "node:process";
import {handle} from "@smuzi/console";

await handle(process.argv, consoleConfig);
