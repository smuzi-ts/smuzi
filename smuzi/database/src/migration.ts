
export type TMigration = {
    up: () => string,
    down: () => string,
}

export const Migrator = () => {
    return {
        add(migration: TMigration) {

        }
    }
}