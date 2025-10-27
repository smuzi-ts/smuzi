import {CreateConsoleRouter} from "@smuzi/console";
import migrationsRun from "#lib/commands/migrations/run.ts";
import migrationsRollback from "#lib/commands/migrations/rollback.ts";

export const databaseConsole = (config) => {
    const router = CreateConsoleRouter('database:');
    router.add('migrations:run', migrationsRun(config))
    router.add('migrations:rollback', migrationsRollback(config))

    return router;
}

