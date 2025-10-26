import {TMigration} from "#lib/types.ts";

export const Migrations = () => {
    const migrations = [];

    return {
        add(migration: TMigration) {
            migrations.push(migration)
        },
        getList() {
            return migrations;
        }
    }
}