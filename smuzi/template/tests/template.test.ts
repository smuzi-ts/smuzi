import {testRunner} from "./index.js";
import {it, assert} from "@smuzi/tests";
import {templateEngine} from "#lib/index.js";
import {faker} from "@smuzi/faker";

const template = templateEngine("./tests/templates", 'jstempl');

testRunner.describe("Template", [
    it("variable", async () => {
        const data = {
            message: faker.string()
        }
        const html = await template.render("variable", data);
        assert.string.contains(html, data.message)
    }),

    it("foreach", async () => {
        const users = faker.repeat.asArray(3, () => ({
            name: faker.string(),
            email: faker.string(),
        }));

        const html = await template.render("foreach", {users});
        assert.string.contains(html, users[0].name)
        assert.string.contains(html, users[1].name)
        assert.string.contains(html, users[2].name)


    }),
])