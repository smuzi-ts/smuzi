import {ConsoleCommand, TInputParams} from "@smuzi/console";
import {UserRepository} from "#users/repositories/UserRepository.js";
import {OptionFromNullable} from "@smuzi/std";

export const usersInfo = ConsoleCommand(async (output, params: TInputParams)=> {
    const userRep = UserRepository();
    const userId = Number(OptionFromNullable(params.id).unwrap('Param --id is required'));
    const user = (await userRep.find(userId));

    console.log('user', user.unwrap().unwrap().created_at.unwrap());
})