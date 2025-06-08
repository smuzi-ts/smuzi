export const Schema = {
    String: (mistmatchedTypes = baseMistmatchedTypes) => ({
        check: baseCheckType("string", mistmatchedTypes)
    }),
    Boolean: (mistmatchedTypes = baseMistmatchedTypes) => ({
        check: baseCheckType("boolean", mistmatchedTypes)
    })
}

const baseCheckType: IBaseCheckType = (expectedType, mistmatchedTypes) => (val) => {
    const realType = typeof val;
    return realType === expectedType ? true : mistmatchedTypes(realType, expectedType)
}

const baseMistmatchedTypes: IHandlerMistmatchedTypes = (realType, expectedType) => {
    return `expected ${expectedType}, found ${realType}`
}


/**
 * Declare Types
 */

type IHandlerMistmatchedTypes = (realType: string, expectedType: string) => string;
type IBaseCheckType = (realType: string, mistmatchedTypes: IHandlerMistmatchedTypes) => (val: any) => true|string;
type IType = (mistmatchedTypes: IHandlerMistmatchedTypes) => {check: IBaseCheckType}
