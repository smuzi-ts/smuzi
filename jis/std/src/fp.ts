export const pipe = (input) => (...fns) => fns.reduce((prevResult, fn) => fn(prevResult), input);

export function* curry(fn, arity = fn.length) {
  const args = [];

  while (args.length < arity) {
    args.push(yield);
  }

  return fn(...args);
}