import { ServerConfig, HttpProtocol, CreateHttpRouter} from "@smuzi/http";
import * as path from "node:path";
import {router as users} from "#users/routes/index.js";
import {env, Some} from "@smuzi/std";

const router = CreateHttpRouter({path: ''});
router.group(users);

export const serverConfig = new ServerConfig({
    protocol: HttpProtocol.HTTPS,
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('80'))),
    router,
    cert: {
        key: path.join('ssl/', 'server.key'),
        cert: path.join('ssl/', 'server.crt'),
    }
});
