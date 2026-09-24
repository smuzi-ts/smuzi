import { postgresMigrations } from "#lib/index.js";

export const logsTable = "logs";

// Mirrors the real "logs" migration so tests run against the exact production schema.
export default postgresMigrations(logsTable).getByName("create_" + logsTable).up();
