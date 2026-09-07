import {TInputCommand} from "../router.js";

export type TInputParser<ParamsKeys extends string = string> = (processArgv: string[]) => TInputCommand<ParamsKeys>