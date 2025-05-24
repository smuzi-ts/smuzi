import {isFunction} from "#stdlib/checks";

const ErrorTypes = {
    IsNotFunctionError: 1,
}

class ValidationError {
    constructor() {
    }
}

const isString = (val, msg =  "") => {
    return typeof val === "string"
}

const isNumber = (val, msg = "") => {
    return typeof val === "number"
}


schema.check(
    {
        a: 2,
        b: 2
    },
    {
        a: isString,
        b: isNumber,
    })

export const schema = {
    check(
        obj = {},
        schema = {}
    ) {
        let status = true
        let errors = []

        for (const property in obj) {
            if (! schema.hasOwnProperty(property)) continue

            const rule = schema[property]
            const val = obj[property]

            if (! rule(val)) {
                errors.push()
            }

        }

        return {status, errors};
    }
}
