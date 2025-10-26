export type TOutputConsole = {
    info: (msg: string) => void,
    success: () => void,
    warn: () => void,
    error: () => void,
    bold: () => void,
}

export type TThemaOutputConsole = {
    info: "\x1b[0m",
    success: "\x1b[32m",
    warn: "\x1b[33m",
    error: "\x1b[31m",
    bold: "\x1b[1m",
};
