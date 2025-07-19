import { asFunction, asObject} from "./checker.ts";

export function isImpl<I>(obj: unknown, keys: (keyof I)[]): obj is I {
  if (typeof obj !== 'object' || obj === null) return false;

  return keys.every((key) => key in obj);
}

type StructBuilder<T = Record<string, unknown>> = ((struct: T) => T) & {
    [key: string]: Function
};

export function impl<M>(builder: StructBuilder, impl: M)
{
    for(const method in impl) {
      if (asFunction(impl[method])) {
        builder[method] = impl[method];
      }
    }
}
