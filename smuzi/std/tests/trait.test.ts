import { impl, isImpl } from "#lib/trait.js";
import { assert, it, okMsg } from "@smuzi/tests";
import {testRunner} from "./index.js";
import { faker } from "smuzi/faker/src/index.js";


testRunner.describe("Std-Trait", [
    it("Simple", () => {
        //Trait
        class SpeakerTrait {
            greeting: (phrase: string, volume: number) => string
            farewell: (phrase: string, volume: number) => string
        }

        //Structure
        class UserStructure {
            constructor(
                public name: string,
                public age: number
            ) {}
        }
        
        //Implementation Trait for Structure
        impl(SpeakerTrait, UserStructure, {
            greeting: (self, phrase: string, volume: number) => {
                return `${self.name} greeting with '${phrase}' and volume ${volume}`; 
            },
            farewell: (self, phrase: string, volume: number) => {
                return `${self.name} farewell with '${phrase}' and volume ${volume}`;
            },
        });

        function hello(speaker: SpeakerTrait) {
            return speaker.greeting("Hello", 50);
        }


        function buy(speaker: SpeakerTrait) {
            return speaker.farewell("Buy", 10);
        }

        const user1 = new UserStructure(
            faker.string(),
            faker.number()
        );

        assert.isImpl(SpeakerTrait, user1);
        assert.equal(hello(user1), `${user1.name} greeting with 'Hello' and volume 50`);
        assert.equal(buy(user1), `${user1.name} farewell with 'Buy' and volume 10`);
    })
])