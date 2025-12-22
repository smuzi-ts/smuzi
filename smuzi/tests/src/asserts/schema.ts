import {AssertionError} from "node:assert";
import {isArray} from "@smuzi/std";
import {SchemaRule} from "@smuzi/schema";
import {assert} from "#lib/assert.js";

export type AssertSchema = {
    selfCheckOk(schema: SchemaRule)
}

export const assertSchema: AssertSchema = {
    selfCheckOk(schema) {
        assert.result.equalOk(schema.validate(schema.fake()));
    }
}