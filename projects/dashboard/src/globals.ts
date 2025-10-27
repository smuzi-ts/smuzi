import {databaseConfig} from "#configs/database.ts";
import "./global.d.ts"

globalThis.query = databaseConfig.current.client.query
