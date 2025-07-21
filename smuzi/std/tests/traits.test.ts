import { impl, isImpl, Struct } from "#std/struct.ts";
import { assert, describe, it, okMsg, skip } from "@smuzi/tests";


describe("Std-Traits", () => {
    it(okMsg("Declare Struct and implement some Trait"), () => {
        class Notificable {
            send: (subject: string) => string
        }

        type User = {
            email: string
            age: number
        } 

        const Admin = Struct<User>();
        const Manager = Struct<User>();

        impl(Notificable, Admin, {
            send(subject: string) {
                return `Sent notification to ${this.email} with subject ${subject}`
            },
        });


        function SendToEmail(sender: Notificable) {
            return sender.send("TEST")
        }

        const adminUser = new Admin({email: "admin@gmail.com", age: 20});
        const managerUser = new Manager({email: "manager@gmail.com", age: 20});

        assert.equal(SendToEmail(adminUser), "Sent notification to admin@gmail.com with subject TEST");

        assert.isNotImpl(Notificable, managerUser)
    });
})