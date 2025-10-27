import {TMigration, TMigrations} from "#lib/types.ts";
import {panic, Struct} from "@smuzi/std";
import {ConsoleRoute} from "@smuzi/console";

export const Migrations = (groupName: string = ''): TMigrations => {
    const migrations = new Map();

    return {
        add(name: string, migration) {
            if (migrations.has(name)) {
                panic(`Migration with name = '${name}' is not unique`)
            }
            migrations.set(name, migration)
        },
        group(migrationsGroup) {
            const groupName = migrationsGroup.getGroupName();

            for (const [name, migration] of migrationsGroup.getList()) {
                migrations.set(groupName + name, migration)
            }
        },
        getList() {
            return migrations;
        },
        getGroupName() {
            return groupName;
        },
        getByName(name) {
            return migrations.get(name);
        }
    }
}

export const Migration = Struct<TMigration>();
