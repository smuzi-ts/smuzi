import { impl, Struct } from "#std/struct.ts";
import { assert, describe, it, okMsg, skip } from "@jis/tests";


describe("Std-Interface", () => {
    it(okMsg("Matched values using RegExp"), () => {
        type Speaker = {
            hello: (volume: number) => string
            goodbay: () => string
        }

        const User = Struct<{ name: string, age: number }>();

        function HelloWorld(speaker: Speaker) {
            return speaker.hello(2)
        }


        impl<Speaker>(User, {
            hello(volume: number) {
                return this.name + " say 'Hello' with volume " + volume
            },
            goodbay() {
                return this.name + " say 'Goodbay'"
            },
        });

        const user1 = new User({ name: "Ban", age: 20 });

        assert.isImpl<Speaker>(user1, ["hello", "goodbay"]);

        assert.equal(HelloWorld(user1), "Ban say 'Hello' with volume 2");
        assert.equal(user1.goodbay(), "Ban say 'Goodbay'");
    });
})