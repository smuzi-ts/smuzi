import {consoleConfig} from "#configs/console.ts";
import * as process from "node:process";
import {handle} from "@smuzi/console";

handle(process.argv, consoleConfig.inputParser, consoleConfig.router);