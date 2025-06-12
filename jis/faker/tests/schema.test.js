import {assert, describe, it} from "@jis/tests";
import {faker} from "../src/index.js";
import {Struct} from "@jis/spec";

describe("Faker-Schema", () => {
    it('1', () => {
        const schema = faker.spec.schema();
        console.log("schema", schema);

        const data = faker.spec.objBySchema(schema);
        const struct = Struct(schema);

        console.log("data", data);

        struct(data);
    })
})