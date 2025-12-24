import {DBSchemaAutonumber, DBSchemaAutonumberConfig} from "#lib/schema/autoNumber.js";
import {DBSchemaRow, DBSchemaRowConfig} from "#lib/schema/row.js";

export const dbSchema = {
    row: <C extends DBSchemaRowConfig>(config: C) => new DBSchemaRow<C>(config),
    autoNumber: ({msgIncorrectFromDB = "Incorrect Autonumber"}: Partial<DBSchemaAutonumberConfig> = {}) => (new DBSchemaAutonumber({msgIncorrectFromDB})),
}