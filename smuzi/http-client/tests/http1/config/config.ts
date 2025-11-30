import { env, Some, http } from "@smuzi/std";
import { buildHttp1ServerConfig } from "@smuzi/http-server";
import { buildHttpClient } from "#lib/index.js";
import  router from "./router.js";


export const serverConfig = buildHttp1ServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    router,
});

export const apiConfig = {
    key: env("API_KEY")
}

export const httpClient = buildHttpClient({
    baseUrl: http.buildUrl(serverConfig.protocol, serverConfig.host, Some(serverConfig.port)),
});

