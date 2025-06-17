let INITIALIZED = false;

const isInitialized = () => INITIALIZED;

export class Exception extends Error {
    file: string;
    line: number;
    column: number;
    meta?: {};
    typeName?: string;
    function?: string;
    method?: string;
    name: string;
    message: string;
    stack?: string;

    constructor(message: string = "", meta: {} = undefined) {
        if (! isInitialized()) {
            throw new Error("Exception preparing stack not Initialized. Please run initPrepareStackTrace() in your application")
        }

        super(message);
        this.meta = meta;
    }
}

export const initPrepareStackTrace = () => {
    const nativePrepareStackTrace = Error.prepareStackTrace;

    const ignoreCallSite = (CallSite) => ! CallSite.getFileName().startsWith('node:internal');

    Error.prepareStackTrace = (err, structuredStackTrace) => {
        if (err instanceof Exception) {
            let currentCallSite = structuredStackTrace[0];

            err.typeName = currentCallSite.getTypeName();
            err.function = currentCallSite.getFunctionName();
            err.method = currentCallSite.getMethodName();
            err.file = currentCallSite.getFileName();
            err.line = currentCallSite.getLineNumber();
            err.column = currentCallSite.getColumnNumber();
        }

        return nativePrepareStackTrace(err, structuredStackTrace);
    };

    INITIALIZED = true;
}
