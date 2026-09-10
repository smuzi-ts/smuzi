import {CreateConsoleRouter} from "@smuzi/console";
import migrationsRun from "./migrations/run.js";
import migrationsRollback from "./migrations/rollback.js";
import migrationsRefresh from "./migrations/refresh.js";
import migrationsFresh from "./migrations/fresh.js";


export const databaseConsole = (db_service, prefix_command = "db:") => {
    const router = CreateConsoleRouter(prefix_command);
    const routerMigrations = CreateConsoleRouter('migrations:');

    routerMigrations.add('run', migrationsRun(db_service))
    routerMigrations.add('rollback', migrationsRollback(db_service))
    routerMigrations.add('refresh', migrationsRefresh(db_service))
    routerMigrations.add('fresh', migrationsFresh(db_service))

    router.group(routerMigrations);

    return router;
}

