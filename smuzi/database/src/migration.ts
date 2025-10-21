export type TMigration = {
    name: string,
    up: () => string,
    down: () => string,
}

export type TMigrations = {
    add: (migration: TMigration) => void,
    getList: () => TMigration[]
}

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