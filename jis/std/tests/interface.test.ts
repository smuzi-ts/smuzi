import { impl, isImpl } from "#std/struct.ts";
import { assert, describe, it, okMsg, skip } from "@jis/tests";


describe("Std-Interface", () => {
    it(okMsg(""), () => {
        class Speaker {
            hello:(self) => (volume: number) => string
        }

        class User {
            constructor(
                public name: string,
                public age: number
            ) {}
        }
        
            
        impl(Speaker, User, {
            hello: (self: User) => (volume: number) => {
                return self.name + " say 'Hello' with volume " + volume
            },
        });

        function HelloWorld(speaker: Speaker) {
            return speaker.hello(2)
        }

        const user1 = new User("test", 20);

        if (isImpl(Speaker, user1)) {
            assert.equal(HelloWorld(user1), "Ban say 'Hello' with volume 2");
        }
    
    });
})