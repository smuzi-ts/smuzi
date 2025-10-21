import { ServerConfig, HttpProtocol, CreateHttpRouter} from "@smuzi/http";
import * as path from "node:path";
import * as process from "node:process";
import {router as users} from "#lib/modules/users/routes/index.js";

const router = CreateHttpRouter({path: ''});
router.group(users);

export const serverConfig = new ServerConfig({
    protocol: HttpProtocol.HTTPS,
    host: process.env.APP_HOST ?? "localhost",
    port: process.env.APP_PORT ?? 80,
    router,
    cert: {
        key: path.join('ssl/', 'server.key'),
        cert: path.join('ssl/', 'server.crt'),
    }
});
