import {consoleConfig} from "#configs/console";
import * as process from "node:process";
import {handle} from "@smuzi/console";

handle(process.argv, consoleConfig.inputParser, consoleConfig.router);