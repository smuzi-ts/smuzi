import {assert, describe, it, repeatIt} from "@smuzi/tests";
import {faker} from "#lib/index.js";

describe("Faker-Spec", () => {
    repeatIt(1, 'objBySchema', (name) => {
        it(name, () => {

            const schema = faker.spec.schema();
            const data = faker.spec.objBySchema(schema);

            assert.objIsValidBySchema(schema, data)
        })

        it('objBySchema-Invalid', () => {
            const schema = faker.spec.schema();
            const data = {
                [faker.string({prefix: "field"})]: null,
                [faker.string({prefix: "field"})]: null,
            };

            assert.objIsInvalidBySchema(schema, data)
        })
    })
})