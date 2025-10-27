import {TMigration} from "#lib/types.ts";
import {panic} from "@smuzi/std";

export const Migrations = () => {
    const migrations = new Map();

    return {
        add(name: string, migration: TMigration) {
            if (migrations.has(name)) {
                panic(`Migration with name = '${name}' is not unique`)
            }
            migrations.set(name, migration)
        },
        getList() {
            return migrations;
        }
    }
}