import {TInputCommand} from "#lib/router.js";

export type TInputParser<ParamsKeys extends string = string> = (processArgv: string[]) => TInputCommand<ParamsKeys>