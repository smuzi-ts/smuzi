import {testRunner} from "./index.js";
import {it, assert} from "@smuzi/tests";
import {ssrEngine} from "#lib/index.js";
import {faker} from "@smuzi/faker";

const ssr = ssrEngine({pathDir: "./tests/templates"});

testRunner.describe("Template", [
    it("variable", async () => {
        const data = {
            var1: faker.string(),
            var2: faker.string(),

        }
        const html = (await ssr.render("variable", data)).unwrap();
        assert.string.contains(html, data.var1)
        assert.string.contains(html, data.var1)

    }),

    it("for of - Array", async () => {
        const users =
                faker.repeat.asArray(3, () => ({
                    name: faker.string(),
                    email: faker.string(),
                }))
        const html = (await ssr.render("for_of", {users})).unwrap();
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

        const html = (await ssr.render("for_of", {users})).unwrap();
        for (const user of users) {
            assert.string.contains(html, user.name)
            assert.string.contains(html, user.name)
            assert.string.contains(html, user.name)
        }
    }),

    // it("component", async () => {
    //     const pageData = {
    //         title: faker.string()
    //     }
    //
    //     const html = (await ssr.render("extends_layout", pageData)).unwrap();
    //     assert.string.contains(html, pageData.title)
    //
    // }),
])