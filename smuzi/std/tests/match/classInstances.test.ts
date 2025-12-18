import { assert, it } from "@smuzi/tests";
import { match } from "#lib/match.js";
import {testRunner} from "../index.js";

class TestClassOne {}
class TestClassTwo {}
class TestClassThree {}

testRunner.describe("Std-match-Class", [
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