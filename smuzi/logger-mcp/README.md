# @smuzi/logger-mcp

MCP server (Streamable HTTP) for querying and retrying logs straight from the logger database.

Tools:

| Tool         | Description                                                                                         |
|--------------|-----------------------------------------------------------------------------------------------------|
| `query_logs` | Search logs grouped by `trace_id`, newest first. Filters: `trace_id`, `message`, `tags`, `limit`, `offset` |
| `get_log`    | Get a single log entry by `id`                                                                      |
| `retry_log`  | Resend the log's original message to its retry url (a real request). Increments `retries_count`     |

---

## Installation

```bash
npm install @smuzi/logger-mcp @smuzi/logger @smuzi/db-postgres @smuzi/http-client @smuzi/std
```

The last four are peer dependencies, install them next to the server.

---

## Configuration

Create a `.env` file in your project root.

```env
# Required: static bearer token, at least 32 characters (openssl rand -hex 32)
LOGGER_MCP_TOKEN=

# Required: the database the logger writes to
DB_DATABASE=
DB_USER=
DB_PASSWORD=

# Optional (defaults shown)
DB_HOST=localhost
DB_PORT=5432
LOGGER_TABLE=logs
LOGGER_MCP_HOST=127.0.0.1
LOGGER_MCP_PORT=8787
LOGGER_MCP_PATH=mcp
```

> Add `.env` to `.gitignore`: it contains the token and the database password.

---

## Running

The binary does not read `.env` by itself, so pass it to node:

```bash
node --env-file=.env node_modules/@smuzi/logger-mcp/build/bin.js
```

Or add a script to your `package.json`:

```json
{
  "scripts": {
    "logger-mcp": "node --env-file=.env node_modules/@smuzi/logger-mcp/build/bin.js"
  }
}
```

```bash
npm run logger-mcp
# logger-mcp listening on http://127.0.0.1:8787/mcp
```

If the variables are already in the environment (Docker, systemd, CI), run the binary directly:

```bash
npx logger-mcp
```

### Embedding in your own process

```ts
import { env, Some } from "@smuzi/std";
import { postgresClient } from "@smuzi/db-postgres";
import { PostgresLogger } from "@smuzi/logger";
import { createLoggerMcpServer, loggerMcpConfigFromEnv, LoggerTools } from "@smuzi/logger-mcp";

const config = loggerMcpConfigFromEnv();
const db_client = postgresClient({
    host: env("DB_HOST", Some("localhost")),
    port: Number(env("DB_PORT", Some("5432"))),
    database: env("DB_DATABASE"),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
});
const logger = new PostgresLogger(env("LOGGER_TABLE", Some("logs")), db_client);

createLoggerMcpServer(new LoggerTools(logger), config).listen(config.port, config.host);
```

---

## Connecting

Endpoint: `http://127.0.0.1:8787/mcp`. Every request must carry `Authorization: Bearer <LOGGER_MCP_TOKEN>`.

### Claude Code

```bash
claude mcp add --transport http logger-mcp http://127.0.0.1:8787/mcp \
  --header "Authorization: Bearer <LOGGER_MCP_TOKEN>"
```

Or in `.mcp.json` of the project that should use it:

```json
{
  "mcpServers": {
    "logger-mcp": {
      "type": "http",
      "url": "http://127.0.0.1:8787/mcp",
      "headers": { "Authorization": "Bearer ${LOGGER_MCP_TOKEN}" }
    }
  }
}
```

Run `/mcp` in Claude Code to check that the server is connected.

### Check with curl

```bash
curl -s http://127.0.0.1:8787/mcp \
  -H "Authorization: Bearer $LOGGER_MCP_TOKEN" \
  -H "content-type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## Remote access

The server listens on loopback by default. To use it from another machine, put it behind a TLS reverse proxy or use an SSH tunnel:

```bash
ssh -L 8787:127.0.0.1:8787 user@server
```

Never expose the port over plain HTTP to the internet.

---

## Notes

- Only `POST` is supported: `GET` and `DELETE` return `405`. There is no SSE stream and no sessions.
- A wrong token returns `401`, a wrong path returns `404`, a body over 1 MB returns `413`.
- `retry_log` makes a real request to the log's retry url. Do not auto-approve it in agents.
