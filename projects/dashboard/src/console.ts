import "./globals.ts";
import {consoleConfig} from "#configs/console.ts";
import * as process from "node:process";
import {handle} from "@smuzi/console";

await handle(process.argv, consoleConfig);
