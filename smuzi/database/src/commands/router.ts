import {CreateConsoleRouter} from "@smuzi/console";
import migrationsRun from "#lib/commands/migrations/run.ts";
import migrationsRollback from "#lib/commands/migrations/rollback.ts";
import migrationsRefresh from "#lib/commands/migrations/refresh.ts";
import migrationsFresh from "#lib/commands/migrations/fresh.ts";


export const databaseConsole = (config) => {
    const router = CreateConsoleRouter('database:');
    const routerMigrations = CreateConsoleRouter('migrations:');

    routerMigrations.add('run', migrationsRun(config))
    routerMigrations.add('rollback', migrationsRollback(config))
    routerMigrations.add('refresh', migrationsRefresh(config))
    routerMigrations.add('fresh', migrationsFresh(config))

    router.group(routerMigrations);

    return router;
}

