import {UserRepository} from "#users/repositories/UserRepository.js";
import { faker } from "@smuzi/faker"
import {ConsoleCommand} from "@smuzi/console";
import {isEmpty} from "@smuzi/std";

export const createUser = ConsoleCommand(async (output, params)=>  {
    const userRep = UserRepository();

    console.log("isEmpty", isEmpty(2));

    const userId = (await userRep.insertRow({
        name: faker.string(),
        email: faker.string(),
        password: "test",
        created_at: new Date()
    }));



    console.log(userId.unwrap().unwrap());
})