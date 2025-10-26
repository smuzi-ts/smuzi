import {databaseConfig} from "#configs/database.ts";
import {Some} from "@smuzi/std";

type UserCreate = {
    id: string
}

export const createUser = async  (params: UserCreate)=>  {
    console.log('createUser', params);

    console.log(await databaseConfig.connection.query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at", Some(['test1', 'test2', 'te3st'])))
}