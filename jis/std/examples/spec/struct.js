import {readonly} from "#lib/prelude.js";

class Exception extends Error {
    file;
    line;
    column;
    meta;

    constructor(message = "", meta = undefined) {
        super(message);
        this.meta = meta;
        this.typeName = this.stack.last.getTypeName();
        this.function = this.stack.last.getFunctionName();
        this.method = this.stack.last.getMethodName();
        this.file = this.stack.last.getFileName();
        this.line = this.stack.last.getLineNumber();
        this.column = this.stack.last.getColumnNumber();
        this.stack = this.stack.traceAsString;
    }
}

class Test {
    method1() {
        const ar = [];
        console.log(ar.lenght)
    }
}


const nativePrepareStackTrace = Error.prepareStackTrace;

const ignoreCallSite = (CallSite) => ! CallSite.getFileName().startsWith('node:internal');

Error.prepareStackTrace = (err, structuredStackTrace) => {
    if (err instanceof Exception) {
        return {
            last: structuredStackTrace[0],
            traceAsString: nativePrepareStackTrace(err, structuredStackTrace.filter(ignoreCallSite)),
        };
    }

    return nativePrepareStackTrace(err, structuredStackTrace);
};

function testStack() {
    // throw new Exception('test')
    let t = new Test();
    t.method1();
}

function wrapper() {
    testStack();
}

try {
    wrapper();
} catch (e) {
    console.log(e)
}



