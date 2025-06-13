
const defaultHandlerUnmatched = (real) => {
    throw new Error('Unmatched value')
}

export const match = (value, handlers, defaultHandler = defaultHandlerUnmatched) => {
    for (const handler of handlers) {
        if (handler[0][ENUM_UID] === value[ENUM_UID]) {
            defaultHandler = handler[1];
        }
    }

    defaultHandler(value);
}

const ENUM_UID = Symbol("ENUM_UID");
const ENUM_MAP = Symbol("ENUM_MAP");

const Enum = (options) => {
    const newOptions = {
        [ENUM_MAP]: new Map() 
    };

    for (const optionName in options) {
        if (typeof options[optionName] === 'function') {
            const uid = Symbol(optionName)
            newOptions[optionName] = (...args) => {
                return Object.assign({[ENUM_UID]: uid}, options[optionName](args))
            }
            newOptions[optionName][ENUM_UID] = uid;
        }
    }

    return newOptions;
}

// const Result = Enum({
//     Ok: (result) => ({
//         isOk: true,
//         value: result
//     }),
//     Err: (err) => ({
//         isOk: false,
//         value: err
//     }),
//     Unhandle: (err) => ({
//         isOk: false,
//         value: err
//     }),
// })
//
// const real = Result.Unhandle("TEST");
//
// match(real, [
//     [Result.Ok, (res) => {console.log("OK=>", res)}],
//     [Result.Err, (res) => {console.log("Err=>", res)}],
// ], (d) => console.log("DEF=>", d))
//
