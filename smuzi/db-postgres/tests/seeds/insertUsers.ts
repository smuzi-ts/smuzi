import {TDatabaseClient} from "@smuzi/database";
import {faker} from "@smuzi/faker";

// export default (dbClient: TDatabaseClient) => {
//     return dbClient.insertManyRows<TUserRow>('users', faker.repeat(10, () => ({
//         name: faker.string(),
//         email: faker.string(),
//         password: faker.string(),
//         created_at: faker.date(),
//     })));
// };