import {assert, it} from "@smuzi/tests";
import {faker} from "#lib/index.js";
import {testRunner} from "./index.js";

testRunner.describe("Faker-Datetime", [
    it('native without params', () => {
        const value = faker.datetime.native();
        assert.datetime.isNative(value)
    }),
    it('native with params', () => {
        const from = new Date("2025-10-11");
        const to = new Date("2025-12-12");
        const value = faker.datetime.native(from, to);
        assert.datetime.isNative(value)
    }),
])