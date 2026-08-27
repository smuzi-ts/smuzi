import { env, Some } from "@smuzi/std";
import { buildHttp1ServerConfig } from "@smuzi/http-server";
import {zohoOAuthRouter} from "#lib/router.js";

export const serverConfig = buildHttp1ServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    router: zohoOAuthRouter.http1(),
});
