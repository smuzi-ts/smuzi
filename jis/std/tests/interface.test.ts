import { asArray, asFunction, asObject, asString } from "#std/checker.ts";
import { isImpl, impl } from "#std/interface.ts";
import { assert, describe, it, okMsg, skip } from "@jis/tests";


type ISay = {
    say: (volume: number) => string
}

function User(struct: {name: string, age: 18}) {
    return struct;
}


describe("Std-Interface", () => {
        it(okMsg("Matched values using RegExp"), () => {
            impl<ISay>(User, { say(volume: number) { return this.name + " Hello " + volume }});

            const user1 = User({name: "TEST", age: 18});

            if (isImpl<ISay>(user1, ["say"])) {
                assert.equal(user1.say(2), "Hello 2");
            }

        });
})