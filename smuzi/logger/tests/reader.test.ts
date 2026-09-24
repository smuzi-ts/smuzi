import { assert, it } from "@smuzi/tests";
import { testRunner } from "./index.js";
import { logsTable } from "./migrations/logsTable.js";
import { PostgresLogger } from "#lib/index.js";

function traceIds(groups: { trace_id: string | null }[]): (string | null)[] {
    return groups.map(group => group.trace_id).sort();
}

testRunner.describe("logger - queryGroups tag filter", [
    it("matches a tag value as a case-insensitive substring", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ trace_id: "t1", message: "start", tags: { route: "/Orders" } })).unwrap();
        (await logger.info({ trace_id: "t2", message: "start", tags: { route: "/users" } })).unwrap();

        const page = (await logger.queryGroups({ tags: [{ key: "route", value: "orders" }] })).unwrap();

        assert.equal(page.total, 1);
        assert.deepEqual(traceIds(page.groups), ["t1"]);
    }),

    it("matches tag existence regardless of value when the filter value is empty", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ trace_id: "t1", message: "db", tags: { db: true } })).unwrap();
        (await logger.info({ trace_id: "t2", message: "no-db", tags: { route: "/users" } })).unwrap();

        const page = (await logger.queryGroups({ tags: [{ key: "db", value: "" }] })).unwrap();

        assert.equal(page.total, 1);
        assert.deepEqual(traceIds(page.groups), ["t1"]);
    }),

    it("requires every distinct tag key to match (AND across keys)", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        // t1 has both tags spread across two logs of the same trace.
        (await logger.info({ trace_id: "t1", message: "start", tags: { route: "/orders" } })).unwrap();
        (await logger.info({ trace_id: "t1", message: "db", tags: { db: true } })).unwrap();
        // t2 only has one of the two tags.
        (await logger.info({ trace_id: "t2", message: "start", tags: { route: "/orders" } })).unwrap();

        const page = (await logger.queryGroups({
            tags: [{ key: "route", value: "orders" }, { key: "db", value: "" }],
        })).unwrap();

        assert.equal(page.total, 1);
        assert.deepEqual(traceIds(page.groups), ["t1"]);
    }),

    it("matches any of several values for the same tag key (OR within a key)", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ trace_id: "t1", message: "start", tags: { route: "/orders" } })).unwrap();
        (await logger.info({ trace_id: "t2", message: "start", tags: { route: "/users" } })).unwrap();
        (await logger.info({ trace_id: "t3", message: "start", tags: { route: "/invoices" } })).unwrap();

        const page = (await logger.queryGroups({
            tags: [{ key: "route", value: "orders" }, { key: "route", value: "users" }],
        })).unwrap();

        assert.equal(page.total, 2);
        assert.deepEqual(traceIds(page.groups), ["t1", "t2"]);
    }),

    it("does not match traces missing the requested tag", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ trace_id: "t1", message: "start", tags: { route: "/orders" } })).unwrap();

        const page = (await logger.queryGroups({ tags: [{ key: "route", value: "missing" }] })).unwrap();

        assert.equal(page.total, 0);
        assert.deepEqual(page.groups, []);
    }),

    it("matches tags on single-log groups without a trace_id", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ message: "heartbeat", tags: { worker: "mailer" } })).unwrap();
        (await logger.info({ trace_id: "t1", message: "start", tags: { route: "/orders" } })).unwrap();

        const page = (await logger.queryGroups({ tags: [{ key: "worker", value: "" }] })).unwrap();

        assert.equal(page.total, 1);
        assert.deepEqual(traceIds(page.groups), [null]);
    }),

    it("escapes LIKE wildcards in the tag value so they are matched literally", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ trace_id: "t1", message: "start", tags: { discount: "5%" } })).unwrap();
        (await logger.info({ trace_id: "t2", message: "start", tags: { discount: "5x" } })).unwrap();

        const page = (await logger.queryGroups({ tags: [{ key: "discount", value: "5%" }] })).unwrap();

        assert.equal(page.total, 1);
        assert.deepEqual(traceIds(page.groups), ["t1"]);
    }),

    it("combines a tag filter with a trace_id filter", async (globalSetup) => {
        const logger = new PostgresLogger(logsTable, globalSetup.unwrap().dbClient);

        (await logger.info({ trace_id: "t1", message: "start", tags: { route: "/orders" } })).unwrap();
        (await logger.info({ trace_id: "t2", message: "start", tags: { route: "/orders" } })).unwrap();

        const page = (await logger.queryGroups({
            trace_id: "t1",
            tags: [{ key: "route", value: "orders" }],
        })).unwrap();

        assert.equal(page.total, 1);
        assert.deepEqual(traceIds(page.groups), ["t1"]);
    }),
])
