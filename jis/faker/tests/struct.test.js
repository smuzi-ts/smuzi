import {assert, describe, it} from "@jis/tests";
import {faker} from "../src/index.js";
import {Struct} from "@jis/spec";

describe("Faker-Struct", () => {
    it('1', () => {
        const schema = faker.Schema();
        const structName = faker.string(5,10);
        const struct = Struct(schema, structName);
        const data = faker.obj(schema);
        const event = struct(data);

        assert.isStructInstance(event, struct);
    })
})