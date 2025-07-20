import { assert, describe, it, okMsg, skip } from "@smuzi/tests";
import { Pipe } from "#std/pipeline.ts";

describe("Std-Pipeline", () => {
    it(okMsg("Do with strings"), () => {
        const start = () => "Val";
        const addOne = (v: string) => v+"+1";
        const addTwo = (v: string) => v+"+2";
        const addThree = (v: string) => v+"+3";

        let res = Pipe.do(start).do(addOne).do(addTwo).do(addThree).get();

        assert.equal(res, "Val+1+2+3");
    })

    it(okMsg("Do with numbers"), () => {
        const start = () => 0;
        const addOne = (v: number) => v+1;
        const addTwo = (v: number) => v+2;
        const addThree = (v: number) => v+3;

        let res = Pipe.do(start).do(addOne).do(addTwo).do(addThree).get();

        assert.equal(res, 6);
    })

    it(okMsg("Created with input value"), () => {
        const addOne = (v: string) => v+"+1";
        const addTwo = (v: string) => v+"+2";
        const addThree = (v: string) => v+"+3";

        let res = Pipe.with("Val").do(addOne).do(addTwo).do(addThree).get();

        assert.equal(res, "Val+1+2+3");
    })

    it(okMsg("Do with many args AND one arg"), () => {
        const addOne = (v1: string, v2: string) => v1+v2+"+addOne";
        const addTwo = (v1) => [v1, "+addTwo"];
        const addThree = (v1: string, v2: string) => [v1+v2, "+addThree"];

        let [res1, res2] = Pipe.with(["Val1", "+Val2"])
        .doArgs(addOne) //Many args
        .do(addTwo) //One arg
        .doArgs(addThree) //Many args
        .get();

        assert.equal(res1, "Val1+Val2+addOne+addTwo");
        assert.equal(res2, "+addThree");
    })

     it(okMsg("Create templates of Pipes"), () => {
        const start1 = () => "VAL ONE";
        const start2 = () => "VAL TWO";

        const addOne = (v: string) => v+"+1";
        const addTwo = (v: string) => v+"+2";

        let add1 = Pipe.do(start1).do(addOne);
        let add2 = Pipe.do(start2).do(addOne);
        
        let res1 = add1.do(addTwo).get();
        let res2 = add2.do(addTwo).get();

        assert.equal(res1, "VAL ONE+1+2");
        assert.equal(res2, "VAL TWO+1+2");
    })


})