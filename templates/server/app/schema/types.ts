export const validation = (schema: {}, args: {})=> {
    return true;
}

type AnyFunction = (...args: any[]) => any;

export const Schema = (schema: {}) => <FN extends AnyFunction>(fn: FN) => (...args: Parameters<FN>): ReturnType<FN> => {
    validation(schema, args);
    return fn(...args)
};


export const type = {
    String: () => ({
        zeroVal: "",
        assert: (val: any) => typeof val === "string"
    }),
    Boolean: () => ({
        zeroVal: false,
        assert: (val: any) => typeof val === "boolean"
    })
}
