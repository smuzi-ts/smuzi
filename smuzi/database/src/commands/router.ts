import {CreateConsoleRouter} from "@smuzi/console";
import migrationsRun from "./migrations/run.js";
import migrationsRollback from "./migrations/rollback.js";
import migrationsRefresh from "./migrations/refresh.js";
import migrationsFresh from "./migrations/fresh.js";


export const databaseConsole = (config) => {
    const router = CreateConsoleRouter('db:');
    const routerMigrations = CreateConsoleRouter('migrations:');

    routerMigrations.add('run', migrationsRun(config))
    routerMigrations.add('rollback', migrationsRollback(config))
    routerMigrations.add('refresh', migrationsRefresh(config))
    routerMigrations.add('fresh', migrationsFresh(config))

    router.group(routerMigrations);

    return router;
}

