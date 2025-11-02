import {databaseConfig} from "#configs/database.ts";
import {keysOfObject, Option, OptionFromNullable} from "@smuzi/std";
import {AutoId, TInsertRow} from "@smuzi/database";

type TUserRow = {
    id: AutoId<Option<string>>,
    name: Option<string>,
    email: Option<string>,
    password: Option<string>,
    created_at: Option<Date>,
}

export const UserRepository = (service = databaseConfig.current) => {
    const table = 'users';

    const publicFields = keysOfObject<TUserRow>(['id', 'name', 'email', 'created_at'])
            .join(',')

    const entityRep = service.buildEntityRepository(service.client)<TUserRow>(table);

    return {
        ...entityRep,
    }
}

