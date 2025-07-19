import { asFunction, asObject} from "./checker.ts";

export function Struct<T extends object>() {
    return class StructClass {
        constructor(struct: T) {
            Object.assign(this, struct);
        }
    } as new (struct: T) => T;
}

export function isImpl<I>(obj: unknown, keys: (keyof I)[]): obj is I {
  if (! asObject(obj)) return false;

  return keys.every((key) => key in obj);
}

type StructBuilder = new (...args: any[]) => any

export function impl<M>(builder: StructBuilder, impl: M)
{
    for(const method in impl) {
      if (asFunction(impl[method])) {
        builder.prototype[method] = impl[method];
      }
    }
}
