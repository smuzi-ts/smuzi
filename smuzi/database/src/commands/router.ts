import {CreateConsoleRouter} from "@smuzi/console";
import {migrate} from "#lib/commands/migrate.ts";

export const databaseConsole = (config) => {
    const router = CreateConsoleRouter('database:');
    router.add('migrate', migrate(config))

    return router;
}

