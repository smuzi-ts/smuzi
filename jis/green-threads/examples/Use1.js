import module1 from "../tasks/module1.js";

export const use1 = async() => {
    try {
        const res =  await module1.method1(1 ,1);
        console.log("RES use1=", res)
    } catch (e) {
        console.log("ERROR", e);
    }

}

