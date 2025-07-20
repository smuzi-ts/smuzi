const Traits = new Set();

export function isImpl<Trait>(trait: new () => Trait, obj: unknown): obj is Trait {
    return Traits.has(obj.constructor.name + "_" + trait.name);
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
  Traits.add(builder.name + "_" + trait.name);
}

export function Struct<T extends object>(className): new (struct: T) => T {
  const StructClass = class {
    static className = className;

    constructor(struct: T) {
      Object.assign(this, struct);
    }
  };

  Object.defineProperty(StructClass, "name", { value: className });

  return StructClass as any;
}
