module.exports = {
    m1: async (p1, p2) => {
        let a = 0
        for (let n = 0; n < 1e1; n++) {
            console.log("---")
            a++
        }
        console.log("OPA")

        return a
    }
}