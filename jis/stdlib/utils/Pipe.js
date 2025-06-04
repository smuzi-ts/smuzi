const Pipe = (...fns) => (input) => fns.reduce((prevResult, fn) => fn(prevResult), input);



const a = ar => {ar.push("a");return ar}
const b = ar => {ar.push("b");return ar}
const c = ar => {ar.push("c");return ar}

const sA = s => s + "_A_"
const sB = s => s + "_B_"
const sC = s => s + "_C_"

const sA2 = (s,c) => s + "_A_"
const sB2 = (s,c) => s + "_B_"
const sC2 = (s,c) => s + "_C_"


const arrABC = Pipe(a, b, c)

let result = arrABC(["Z"])

console.log("result arrABC", result)

const stringABC = Pipe(sA, sB, sC)

result = stringABC("Z")

console.log("result stringABC", result)


