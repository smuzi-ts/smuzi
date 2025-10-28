import {UserRepository} from "#users/repositories/UserRepository.ts";

export const createUser = async  (output, params)=>  {
    const userRep = UserRepository();

    const resp = await userRep.insertRow({
        name: "test",
        email: "test",
        password: "test",
        created_at: new Date()
    })

    console.log(resp)
}