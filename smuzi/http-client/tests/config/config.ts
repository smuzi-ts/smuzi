import { env, Some, buildHttpUrl } from "@smuzi/std";
import { buildHttpServerConfig } from "@smuzi/http-server";
import { buildHttpClient } from "#lib/index.js";
import  router from "./router.js";


export const serverConfig = buildHttpServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    router,
});

export const apiConfig = {
    key: env("API_KEY")
}

export const httpClient = buildHttpClient({
    baseUrl: Some(buildHttpUrl(serverConfig.protocol, serverConfig.host, Some(serverConfig.port))),
});

