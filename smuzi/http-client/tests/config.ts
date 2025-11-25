import { env, Some, buildHttpUrl } from "@smuzi/std";
import { CreateHttpRouter, buildHttpServerConfig } from "@smuzi/http-server";

const router = CreateHttpRouter({ path: '' });

export const serverConfig = buildHttpServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    router,
});

export const serverEndpoint = buildHttpUrl(serverConfig.protocol, serverConfig.host, Some(serverConfig.port));