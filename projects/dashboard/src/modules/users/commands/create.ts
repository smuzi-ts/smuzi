import {UserRepository} from "#users/repositories/UserRepository.ts";
import { faker } from "@smuzi/faker"
export const createUser = async  (output, params)=>  {
    const userRep = UserRepository();

    const userId = (await userRep.insertRow({
        name: faker.string(),
        email: faker.string(),
        password: "test",
        created_at: new Date()
    }));

    console.log(userId);
}