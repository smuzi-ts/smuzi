import {TInsertRowResult, TQueryResult,} from "./types.js";
import {Option, panic} from "@smuzi/std";

export type TMigrationLogRow = {
    id: number,
    name: string,
    branch: number,
    action: string,
    sql_source: string,
    created_at: Date,
}

export type TMigrationLogInsert = Omit<TMigrationLogRow, "id">;

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
    createTableIfNotExists(): Promise<TQueryResult>,
    listRuned(): Promise<TQueryResult<TMigrationLogRow>>,
    listRunedByBranch(branch: number): Promise<TQueryResult<TMigrationLogRow>>,
    getLastBranch(): Promise<Option<number>>,
    create(row: TMigrationLogInsert, returningColumns?: readonly (keyof TMigrationLogRow)[]): Promise<TInsertRowResult<TMigrationLogRow>>,
    migrationLastAction(name: string): Promise<Option<string>>,
    migrationWillBeRuned(name: string): Promise<boolean>,
    freshSchema(): Promise<TQueryResult>
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
