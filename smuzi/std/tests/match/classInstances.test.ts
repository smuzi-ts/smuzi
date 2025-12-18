import { assert, describe, it, okMsg } from "@smuzi/tests";
import { match } from "#lib/match.js";

class TestClassOne {}
class TestClassTwo {}
class TestClassThree {}

export default describe("Std-match-Class", [
    it("Instanceof", () => {
        const obj = new TestClassTwo;
        const patterns = new Map();
        patterns.set(v => v instanceof TestClassOne, "TestClassOne");
        patterns.set(v => v instanceof TestClassTwo, "TestClassTwo");
        const resultMatch = match(obj, patterns, 'undefined')

        assert.equal(resultMatch, "TestClassTwo")
    }),
    it("Instanceof Default", () => {
        const obj = new TestClassThree;
        const patterns = new Map();
        patterns.set(v => v instanceof TestClassOne, "TestClassOne");
        patterns.set(v => v instanceof TestClassTwo, "TestClassTwo");
        const resultMatch = match(obj, patterns, 'undefined')

        assert.equal(resultMatch, "undefined")
    }),
])