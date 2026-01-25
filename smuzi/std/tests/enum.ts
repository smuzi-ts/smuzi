import { assert, it } from "@smuzi/tests";
import { testRunner } from "./index.js";
import { Enum } from "#lib/index.js";
import { faker } from "@smuzi/faker";
import { match } from "assert";

testRunner.describe("Std-Enum", [
    it("Enum", () => {
        class Guest {
        }

        class User {}

        class Admin {
            constructor(rating: string) {}
        }

        const Role = Enum({
            User,
            Admin,
        });

        const superAdmin = new Role.Admin("SuperAdmin");

        function check(role: typeof Role.__infer): boolean {
            return role instanceof User;
        }

        const res = check("superAdmin");
    }),

]
)