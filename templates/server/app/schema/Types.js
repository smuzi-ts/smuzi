export const T = {
    String: () => ({
        check: checkBaseType("string")
    }),
    Boolean: () => ({
        check: checkBaseType("boolean")
    })
}

const checkBaseType = (expectedType) => (val) => {
    const realType = typeof val;
    return realType === expectedType ? true : mistmatchedTypes(realType, expectedType)
}

const mistmatchedTypes = (realType, expectedType) => {
    return `expected ${expectedType}, found ${realType}`
}
