import {assert, describe, it, okMsg} from "@smuzi/tests";
import {TUserRow} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {GlobalSetup} from "./index.js";

export default describe("db-postgres - query", [
    it(okMsg("SELECT"), async (globalSetup: GlobalSetup) => {

        const result = (await dbClient.query<TUserRow[]>('SELECT id, name, email FROM users'));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (rows) => {
                assert.isArray(rows);
                assert.isObject(rows[0]);
                assert.object.hasProperty(rows[0], 'id');
                assert.object.hasProperty(rows[0], 'name');
                assert.object.hasProperty(rows[0], 'email');
            },
        })
    })
])