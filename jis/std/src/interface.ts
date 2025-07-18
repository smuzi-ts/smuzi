import { isFunction, isObject } from "./checker.ts";
import { IMatched } from "./match.ts";

export function isImpl<T extends unknown>(obj: unknown): obj is T;

export function isImpl(obj: unknown): obj is IMatched {
  return isObject(obj) && isFunction(obj.match);
}