import {assert, describe, it} from "@jis/tests";
import {faker} from "../src/index.js";

describe("Faker-Spec", () => {
    for (let i = 0; i < 5; i++) {
        it('objBySchema-'+i, () => {
            const schema = faker.spec.schema();
            const data = faker.spec.objBySchema(schema);

            assert.objIsValidBySchema(schema, data)
        })

        it('objBySchema-Invalid-'+i, () => {
            const schema = faker.spec.schema();
            const data = {
                [faker.string(5,10)]: null,
                [faker.string(5,10)]: null,
            };

            assert.objIsInvalidBySchema(schema, data)
        })
    }
})