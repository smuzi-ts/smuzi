import {TInputParams} from "@smuzi/console";
import {UserRepository} from "#users/repositories/UserRepository.ts";
import {OptionFromNullable} from "@smuzi/std";

export const usersInfo = async (output, params: TInputParams)=> {
    const userRep = UserRepository();
    const userId = Number(OptionFromNullable(params.id).unwrap('Param --id is required'));
    const user = (await userRep.find(userId))
        .unwrap()
        .unwrap();

    console.log('user', user);
}