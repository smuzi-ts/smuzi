import {databaseConfig} from "#configs/database.js";
import "./global.d.js"

globalThis.query = databaseConfig.current.client.query
