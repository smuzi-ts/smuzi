type UserCreate = {
    id: string
}
export const createUser = (params: UserCreate)=>  {
    console.log('createUser', params);
}