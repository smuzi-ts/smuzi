export const T = {
    String: () => ({
        zeroVal: "",
        check: checkBaseType("string")
    }),
    Boolean: () => ({
        zeroVal: false,
        check: checkBaseType("boolean")
    })
}

const checkBaseType = (expectedType) => (variablePath, val) => {
    const realType = typeof val;
    return realType === expectedType ? true : mistmatchedTypes(variablePath, realType, expectedType)
}

const mistmatchedTypes = (variablePath, realType, expectedType) => {
    return `${variablePath} expected ${expectedType}, found ${realType}`
}
