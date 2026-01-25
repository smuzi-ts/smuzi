import { assert, it } from "@smuzi/tests";
import { testRunner } from "./index.js";
import { querystring } from "#lib/querystring.js";
import { faker } from "@smuzi/faker";

testRunner.describe("Std-querystring", [
    it("fromString - Cyrillic", () => {
        const name = faker.stringModule.cyrillic();
        const city = faker.stringModule.cyrillic();
        const age = String(faker.number());

        const queryString = `name=${name}&city=${city}&age=${age}`;

        const paramsUnwrap = querystring.fromString(queryString).unwrap();
        assert.equal(paramsUnwrap.get("name").unwrap(), name);
        assert.equal(paramsUnwrap.get("city").unwrap(), city);
        assert.equal(paramsUnwrap.get("age").unwrap(), age);
    }),
    it("fromString - Duplicate keys (arrays)", () => {
        type CategoriesParams = {
            categories: string[]
        }

        const category1 = faker.string();
        const category2 = faker.string();
        const category3 = faker.string();

        const queryString = `categories=${category1}&categories=${category2}&categories=${category3}`;

        const paramsUnwrap = querystring.fromString<CategoriesParams>(queryString).unwrap();
        const categories = paramsUnwrap.get("categories").unwrap();
        assert.equal(categories[0], category1);
        assert.equal(categories[1], category2);
        assert.equal(categories[2], category3);
    }),

    it("fromString - Special characters and spaces", () => {
        const search = "hello world";
        const email = "test@example.com";
        const url = "https://google.com/search?q=test";

        const queryString = `search=${encodeURIComponent(search)}&email=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}`;

        const paramsUnwrap = querystring.fromString(queryString).unwrap();
        assert.equal(paramsUnwrap.get("search").unwrap(), search);
        assert.equal(paramsUnwrap.get("email").unwrap(), email);
        assert.equal(paramsUnwrap.get("url").unwrap(), url);
    }),

    it("fromString - Empty values and missing values", () => {
        const key = faker.string();
        const value = faker.string();

        const queryString = `foo=&bar&baz=${value}&empty=&key=${key}`;

        const paramsUnwrap = querystring.fromString(queryString).unwrap();
        assert.equal(paramsUnwrap.get("foo").unwrap(), "");
        assert.equal(paramsUnwrap.get("bar").unwrap(), "");
        assert.equal(paramsUnwrap.get("baz").unwrap(), value);
        assert.equal(paramsUnwrap.get("empty").unwrap(), "");
        assert.equal(paramsUnwrap.get("key").unwrap(), key);
    }),

    it("fromString - obj instead of string", () => {
        const obhInsteadOfString = { a: faker.string() }

        const params = querystring.fromString(obhInsteadOfString as any);
        assert.result.equalErr(params)
    }),

]
)