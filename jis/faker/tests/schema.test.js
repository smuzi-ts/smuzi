import {assert, describe, it, repeatIt} from "@jis/tests";
import {faker} from "#lib/index.js";

describe("Faker-Spec", () => {
    repeatIt(5, 'objBySchema', (name) => {
        it(name, () => {

            const schema = faker.spec.schema();
            const data = faker.spec.objBySchema(schema);

            assert.objIsValidBySchema(schema, data)
        })

        it('objBySchema-Invalid', () => {
            const schema = faker.spec.schema();
            const data = {
                [faker.string(5,10)]: null,
                [faker.string(5,10)]: null,
            };

            assert.objIsInvalidBySchema(schema, data)
        })
    })
})