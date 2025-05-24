import {isFunction} from "#stdlib/checks";

const ErrorTypes = {
    IsNotFunctionError: 1,
}

class ValidationError {
    constructor() {
    }
}

export const schema = {
    syncCheck(
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
