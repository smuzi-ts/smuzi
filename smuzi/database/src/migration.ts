import {TInsertRow, TInsertRowResult, TQueryResult,} from "#lib/types.js";
import {Option, panic} from "@smuzi/std";
import {schema, SchemaObject} from "@smuzi/schema";


export const migrationLogRowSchema = schema.obj({
    id: schema.storage.autoNumber(),
    name: schema.string(),
    branch: schema.number(),
    action: schema.string(),
    sql_source: schema.string(),
    created_at: schema.datetime.native(),
})

export type TMigrationLogRowSchema = typeof migrationLogRowSchema;
export type TMigrationLogSave = TMigrationLogRowSchema["__infer"]

export type TMigration = {
    up: () => string,
    down: () => string,
}

export type TMigrations = {
    add: (name: string, migration: TMigration) => void,
    group: (migrations: TMigrations) => void,
    getList: () => Map<string, TMigration>,
    getByName: (name: string) => TMigration,
    getGroupName:() => string
}

export enum TMigrationLogAction {
    up = 'up',
    down = 'down',
}




export type TMigrationsLogRepository = {
    getTable(): string,
    createTableIfNotExists(): Promise<TQueryResult<never>>,
    listRuned(): Promise<TQueryResult<TMigrationLogRowSchema>>,
    listRunedByBranch(branch: number): Promise<TQueryResult<TMigrationLogRowSchema>>,
    getLastBranch(): Promise<Option<number>>,
    create<const RC extends (keyof TMigrationLogSave)[]>(row: TInsertRow<TMigrationLogRowSchema>, returningColumns?: RC): Promise<TInsertRowResult<TMigrationLogRowSchema, RC>>,
    migrationLastAction(name: string): Promise<Option<string>>,
    migrationWillBeRuned(name: string): Promise<boolean>,
    freshSchema(): Promise<TQueryResult<SchemaObject<any>>>
};


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

export function Migration(migration: TMigration){
    return migration;
}
