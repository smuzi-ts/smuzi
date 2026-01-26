import { asFunction, asObject } from "./checker.js";
import { dump } from "./debug.js";


type Trait =  any;

// Витягуємо типи параметрів функції (без першого - self)
type DropFirst<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

// Трансформуємо трейт в імплементацію з self
type Implementation<T extends Trait, S> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
        ? (self: S, ...args: Args) => Return
        : never;
};

const Traits = new Set();


export function isImpl<Trait>(trait: new () => Trait, obj: unknown): obj is Trait {
    if (asFunction(obj?.constructor)) {
        return Traits.has(trait.name+"___"+obj.constructor.name);
    }
    return false;
}

export function impl<
    T extends Trait,
    S extends new (...args: any[]) => any
>(
    trait: new () => T,
    builder: S,
    implementation: Implementation<InstanceType<typeof trait>, InstanceType<S>>
): void {
  for (const method in implementation) {
        if (asFunction(implementation[method])) {
            builder.prototype[method] = function (...args) {
                return (implementation[method] as any)(this, ...args);
            }
        }

    }
    Traits.add(trait.name+"___"+builder.name);
}
