const STD_TYPE_PROPERTY = Symbol("STD_TYPE_PROPERTY");
const STD_TYPE_ENUM = "STD_TYPE_ENUM";

type Constructor<T = unknown> = new (...args: any[]) => T;
declare const Brand: unique symbol


export type EnumType<Options  extends Record<string, Constructor>> = Options & {
    STD_TYPE_PROPERTY: string
    __infer: InstanceType<Options[keyof Options]> 
}

export function Enum<Options extends Record<string, Constructor>>(options: Options): EnumType<Options> {
    return Object.assign({
        STD_TYPE_PROPERTY: STD_TYPE_ENUM
    }, options) as EnumType<Options>;
}
