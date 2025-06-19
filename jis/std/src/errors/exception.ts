let INITIALIZED = false;

const isInitialized = () => INITIALIZED;

export class Exception extends Error {
    file: string;
    line: number;
    column: number;
    typeName?: string;
    function?: string;
    method?: string;
    meta?: any

    constructor(message: string = "", meta: {} = undefined) {
        if (! isInitialized()) {
            throw new Error("Exception preparing stack not Initialized. Please run initPrepareStackTrace() in your application")
        }
        super(message)
        this.setLastCallSite();
        this.meta = meta;
    }

    setLastCallSite() {
        this.typeName = this.stack.last.getTypeName();
        this.function = this.stack.last.getFunctionName();
        this.method = this.stack.last.getMethodName();
        this.file = this.stack.last.getFileName();
        this.line = this.stack.last.getLineNumber();
        this.column = this.stack.last.getColumnNumber();
        this.stack = this.stack.traceAsString;
    }

}

export const initPrepareStackTrace = () => {
    if (INITIALIZED) {
        return;
    }

    const nativePrepareStackTrace = Error.prepareStackTrace;

    const ignoreCallSite = (CallSite) => ! CallSite.getFileName().startsWith('node:internal');

    Error.prepareStackTrace = (err, structuredStackTrace) => {
        if (err instanceof Exception) {
            return {last: structuredStackTrace[0], traceAsString: nativePrepareStackTrace(err, structuredStackTrace)};
        }

        return nativePrepareStackTrace(err, structuredStackTrace);
    };

    INITIALIZED = true;
}


initPrepareStackTrace();