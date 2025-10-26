import {TInputParams} from "@smuzi/console";

type User = {
    id: number,
    name: string,
}

export const usersInfo = async (params: TInputParams)=> {
    const res = await query<User>("SELECT * FROM users")
    console.log(res.unwrap()[0])
}