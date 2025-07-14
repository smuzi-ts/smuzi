export const pipe = (...fns) => (input) => fns.reduce((prevResult, fn) => fn(prevResult), input);
export const compose = (...fns) => pipe(...fns.reverse());
export const pipeIn = (input) => (...fns) => fns.reduce((prevResult, fn) => fn(prevResult), input);
