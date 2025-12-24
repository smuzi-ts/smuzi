import {DBSchemaAutonumber, DBSchemaAutonumberConfig} from "#lib/schema/autoNumber.js";

export const dbSchema = {
    autoNumber: ({msgIncorrectFromDB = "Incorrect Autonumber"}: Partial<DBSchemaAutonumberConfig> = {}) => (new DBSchemaAutonumber({msgIncorrectFromDB})),
}