import {assert, describe, it, okMsg, before, after} from "@smuzi/tests";
import {buildClient, globalSetup, globalTeardown} from "./setup.js";
import {faker} from "@smuzi/faker";
describe("db-postgres - UPDATE rows", () => {
    before(globalSetup);
    after(globalTeardown);

    it(okMsg("Update one row"), async () => {
        const dbClient = buildClient();

        const result = (await dbClient.updateRow<any>('users', 1, {
            name: faker.string()
        }));

        result.match({
            Err: (error) => {
                assert.fail(error.message)
            },
            Ok: (rows) => {
                console.log({rows})
                assert.isArray(rows);
                assert.isObject(rows[0]);
            },
        })
    })
})