import { HttpServerConfig, CreateHttpRouter} from "@smuzi/http-server";
import {router as users} from "#users/routes/index.js";
import {env, Some, path, HttpProtocol} from "@smuzi/std";

const router = CreateHttpRouter({path: ''});
router.group(users);

export const httpServerConfig = HttpServerConfig({
    protocol: HttpProtocol.HTTPS,
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('80'))),
    router,
    cert: Some({
        key: path.join('ssl/', 'server.key'),
        cert: path.join('ssl/', 'server.crt'),
    })
});
