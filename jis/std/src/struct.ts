import { asFunction, asObject} from "./checker.ts";

type ClassBuilder = new (...args: any[]) => any

const Traits = new Set();


export function isImpl<Trait>(trait: new () => Trait, obj: unknown): obj is Trait {
  return Traits.has(obj.constructor.name + trait.constructor.name);
}

export function impl<Trait, S = any>(trait: new () => Trait, builder: ClassBuilder, impl: Trait)
{
    for(const method in impl) {
      if (asFunction(impl[method])) {
        builder.prototype[method] = impl[method];
      }
    }

    Traits.add(builder.constructor.name + trait.constructor.name);
}
