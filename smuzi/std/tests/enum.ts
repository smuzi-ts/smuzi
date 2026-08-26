import { assert, it } from "@smuzi/tests";
import { testRunner } from "./index.js";
import { Enum } from "#lib/index.js";

testRunner.describe("Std-Enum", [
    it("Enum", () => {
   
    class User {}
    class Admin {constructor(rating: string) {}}
    
    const Role = Enum("Role",
    {
        User,
        Admin,
    })

    const superAdmin = new Role.Admin("SuperAdmin");

    function check(role: typeof Role.__variant): boolean {
        return match(role, )
    }

    const res = check("superAdmin");
    
    }),

]
)