import * as bootstrap from "#app/bootstrap/index"

core.logger().debug("string")

class Schema {
    isString(value) {
        return typeof value === "string"
    }

    isNumber(value) {
        return typeof value === "number"
    }
}

function f1(...d) {
    console.log(...d)
}

function f2(...d) {
    f1(...d)
}


f2('a', 'b', 'c')

// function* ggg() {
//     yield 1
//     yield 2
//     yield 3
// }
//
// console.log(ggg())
//
// console.log(ggg())
//
// console.log(ggg())

