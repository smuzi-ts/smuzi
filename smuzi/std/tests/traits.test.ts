import { dump } from "#std/debug.ts";
import { impl, isImpl, Struct} from "#std/struct.ts";
import { assert, describe, it, okMsg, skip } from "@smuzi/tests";


describe("Std-Traits", () => {
    it(okMsg("Declare Struct and implement some Trait"), () => {
        class Notificable {
            send: (subject: string) => string
        }

        const User = Struct<{email: string, age: number}>('User');

        impl(Notificable, User, {
            send(subject: string) {
                return `Sent notification to ${this.email} with subject ${subject}`
            },
        });

        function SendToEmail(sender: Notificable) {
            return sender.send("TEST")
        }

        const user1 = new User({email: "test@gmail.com", age: 20});

        assert.equal(SendToEmail(user1), "Sent notification to test@gmail.com with subject TEST");
    });
})