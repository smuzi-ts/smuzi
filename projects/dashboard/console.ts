import {consoleConfig} from "#configs/console";
import * as process from "node:process";

const inputParams = consoleConfig.inputParser(process.argv);

console.log(inputParams);

consoleConfig.router