import {testRunner} from "./index.js";
import {it, assert} from "@smuzi/tests";
import {templateEngine} from "#lib/index.js";
import {faker} from "@smuzi/faker";

const template = templateEngine({pathDir: "./tests/templates"});

testRunner.describe("Template", [
    it("variable", async () => {
        const data = {
            message: faker.string()
        }
        const html = (await template.render("variable", data)).unwrap();
        assert.string.contains(html, data.message)
    }),

    it("for of - Array", async () => {
        const users =
                faker.repeat.asArray(3, () => ({
                    name: faker.string(),
                    email: faker.string(),
                }))
        const html = (await template.render("for_of", {users})).unwrap();
        assert.string.contains(html, users[0].name);
        assert.string.contains(html, users[1].name);
        assert.string.contains(html, users[2].name);
        assert.string.contains(html, users[0].name + "__suffix");
        assert.string.contains(html, users[1].name + "__suffix");
        assert.string.contains(html, users[2].name + "__suffix");
    }),

    it("for of - Set", async () => {
        const users =
            faker.repeat.asNativeSet(3, () => ({
                name: faker.string(),
                email: faker.string(),
            }))

        const html = (await template.render("for_of", {users})).unwrap();
        for (const user of users) {
            assert.string.contains(html, user.name)
            assert.string.contains(html, user.name)
            assert.string.contains(html, user.name)
        }
    }),
])