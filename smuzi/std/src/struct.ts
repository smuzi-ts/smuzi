import { dump } from "./debug.ts";

const Traits = new Set();

export function isImpl<Trait>(trait: new () => Trait, obj: unknown): obj is Trait {
    return Traits.has([obj.constructor.name, trait.name]);
}

type StructBuilder<T = any> = new (...args: any[]) => T;

type TraitImpl<Trait, Struct> = {
    [K in keyof Trait]: Trait[K] extends (...args: infer A) => infer R
      ? (this: Struct, ...args: A) => R
      : Trait[K]
  }

export function impl<Trait, Struct>(
  trait: new () => Trait,
  builder: StructBuilder<Struct>,
  impl: TraitImpl<Trait, Struct>
): asserts builder is StructBuilder<Struct & Trait> {
  for (const method in impl) {
    if (typeof impl[method] === "function") {
      builder.prototype[method] = impl[method]!;
    }
  }
  Traits.add([builder.name, trait.name]);
}

export function Struct<T extends object>(name: string = "CustomStruct"): new (struct: T) => Readonly<T> {
  const structName = Symbol(name);
  const StructClass = class {
    constructor(struct: T) {
      Object.assign(this, struct);
      Object.freeze(this)
    }
  };

  Object.defineProperty(StructClass, "name", { value: structName });

  return StructClass as any;
}
