import module1 from "../tasks/module1.js";

export const use2 = async() => {
    const res = await module1.method1(1 ,1)
    console.log('use2 res =', res)
}
