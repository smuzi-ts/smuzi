export type TOutputConsole = {
    info: (...vars ) => void,
    success: (...vars ) => void,
    warn: (...vars ) => void,
    error: (...vars ) => void,
    bold: (...vars ) => void,
}

export type TThemaOutputConsole = {
    default: string,
    info: string,
    success: string,
    warn: string,
    error: string,
    bold: string,
};
