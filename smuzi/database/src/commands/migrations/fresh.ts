import {TDatabaseConfig} from "#lib/types.js";
import {TOutputConsole} from "@smuzi/console";
import rollback from "#lib/commands/migrations/rollback.ts";
import run from "#lib/commands/migrations/run.ts";
import {Ok, OkOrNullableAsError, OptionFromNullable} from "@smuzi/std";
import {buildMigrationsLogRepository, TMigrationLogAction} from "#lib/migrationsLogRepository.ts";

export default function (config: TDatabaseConfig) {
    return async (output: TOutputConsole, params) => {
        const service = OptionFromNullable(params.service).match({
            Some: (key) => OkOrNullableAsError(config.services[key], `Service "${key}" not exists`),
            None: () => Ok(config.current),
        })
            .unwrap();

        output.success('Drop all tables...');

        (await service.client.query(`DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;`)).unwrap();

        await run(config)(output, params);
    }
}