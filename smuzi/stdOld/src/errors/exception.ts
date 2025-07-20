import {isNone} from "#lib/prelude.js";

let initialized = false;

const isCustomized = () => ! isNone(Error.prepareStackTrace);
const isInitialized = () => initialized;

export class Exception extends Error {
    file?: string;
    line?: number;
    column?: number;
    typeName?: string;
    function?: string;
    method?: string;
    meta?: any

    constructor(message: string = "", meta: {} = undefined) {
        if (isCustomized() && ! isInitialized()) {
            throw new Error("Exception preparing stack not Initialized. Please run initPrepareStackTrace() in your application")
        }
        super(message)
        this.setLastCallSite();
        this.meta = meta;
    }

    setLastCallSite() {
        if (! isNone(this?.stack.last)) {
            this.typeName = this.stack.last.getTypeName();
            this.function = this.stack.last.getFunctionName();
            this.method = this.stack.last.getMethodName();
            this.file = this.stack.last.getFileName();
            this.line = this.stack.last.getLineNumber();
            this.column = this.stack.last.getColumnNumber();
        }

        if (! isNone(this?.stack.traceAsString)) {
            this.stack = this.stack.traceAsString;
        }
    }

}

const defaultInitPrepareStackTrace = () => {
    if (initialized) {
        return;
    }

    const nativePrepareStackTrace = Error.prepareStackTrace;

    if (isNone(nativePrepareStackTrace)) {
        initialized = true;

        return;
    }

    const ignoreCallSite = (CallSite) => ! CallSite.getFileName().startsWith('node:internal');

    Error.prepareStackTrace = (err, structuredStackTrace) => {
        if (err instanceof Exception) {
            return {last: structuredStackTrace[0], traceAsString: nativePrepareStackTrace(err, structuredStackTrace)};
        }

        return nativePrepareStackTrace(err, structuredStackTrace);
    };

    initialized = true;
}

export const initPrepareStackTrace = (fn = defaultInitPrepareStackTrace) => {
    fn();
}

initPrepareStackTrace();
