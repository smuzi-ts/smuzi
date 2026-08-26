const STD_TYPE_PROPERTY = Symbol("STD_TYPE_PROPERTY");
const STD_TYPE_ENUM = "ENUM";
const STD_ENUM_NAME = "STD_ENUM_NAME";

type Constructor<T = unknown> = new (...args: any[]) => T;
declare const Brand: unique symbol

type EnumVariant = {
    [STD_TYPE_PROPERTY]: "ENUM_VARIANT",
}

export type EnumType<Variants  extends Record<string, Constructor>> = Variants & {
    [STD_TYPE_PROPERTY]: string
    __variant: InstanceType<Variants[keyof Variants]> 
}

export function Enum<Variants extends Record<string, Constructor>>(enumName: string, variants: Variants): EnumType<Variants> {
    return Object.assign(variants, {
        [STD_TYPE_PROPERTY]: STD_TYPE_ENUM,
        __variant: undefined as any,
        [STD_ENUM_NAME]: Symbol(enumName)
    })
}
