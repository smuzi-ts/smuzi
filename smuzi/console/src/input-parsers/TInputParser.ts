export type TInputParams = Record<string, string> | {};

export type TInputCommand = {
    path: string,
    params: TInputParams,
};

export type TInputParser = (processArgv: string) => TInputCommand