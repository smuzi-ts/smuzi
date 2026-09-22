import {Option} from "@smuzi/std";

export const usersTable = 'users';

export type UserRow = {
    id: number,
    name: Option<string>,
    email: string,
    password: string,
    created_at: Date,
};

export type UserInsert = Omit<UserRow, 'id'>;
