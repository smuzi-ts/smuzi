import {TDatabaseClient} from "@smuzi/database";
import {faker} from "@smuzi/faker";
import {userSchema} from "../entities/User.js";
import {Some} from "@smuzi/std";

export default (dbClient: TDatabaseClient) => {
    return dbClient.insertManyRows('users', userSchema, faker.repeat.asArray(10, () => ({
        name: Some(faker.string()),
        email: faker.string(),
        password: faker.string(),
        created_at: faker.datetime.native(),
    })));
};