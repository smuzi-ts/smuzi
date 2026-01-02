import {testRunner} from "./index.js";
import {it, assert} from "@smuzi/tests";
import {ssrEngine} from "#lib/index.js";
import {faker} from "@smuzi/faker";
import {dump} from "@smuzi/std";

const ssr = ssrEngine({pathDir: "./tests/templates"});

testRunner.describe("Template", [
    it("variable", async () => {
        const data = {
            var1: faker.string(),
            var2: faker.string(),
            var3: faker.string(),

        }
        const html = (await ssr.render("variable", data)).unwrap();
        assert.string.contains(html, "<html")
        assert.string.contains(html, "</html>")
        assert.string.containsOnce(html, data.var1)
        assert.string.containsOnce(html, data.var2)
        assert.string.containsOnce(html, data.var3)


    }),

    it("for of - Array", async () => {
        const users =
                faker.repeat.asArray(3, () => ({
                    name: "user_" + faker.string(),
                    email: faker.string() + "@gmail.com",
                }))

        const posts = faker.repeat.asArray(3, () => "post_" + faker.string())

        const html = (await ssr.render("for_of", {users, posts})).unwrap();
        assert.string.contains(html, "<html")
        assert.string.contains(html, "</html>")
        assert.string.containsOnce(html, users[0].name);
        assert.string.containsOnce(html, users[1].name);
        assert.string.containsOnce(html, users[2].name);
        assert.string.containsOnce(html, posts[0]);
        assert.string.containsOnce(html, posts[1]);
        assert.string.containsOnce(html, posts[2]);
    }),

    it("for of - Set", async () => {
        const users =
            faker.repeat.asNativeSet(3, () => ({
                name: "user_" + faker.string(),
                email: faker.string() + "@gmail.com",
            }))

        const posts = faker.repeat.asNativeSet(3, () => "post_" + faker.string())


        const html = (await ssr.render("for_of", {users, posts})).unwrap();
        assert.string.contains(html, "<html")
        assert.string.contains(html, "</html>")

        for (const user of users) {
            assert.string.contains(html, user.name)
            assert.string.contains(html, user.name)
            assert.string.contains(html, user.name)
        }

        for (const post of posts) {
            assert.string.contains(html, post)
            assert.string.contains(html, post)
            assert.string.contains(html, post)
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