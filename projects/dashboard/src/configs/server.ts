import {buildHttp1ServerConfig, CreateHttp1Router} from "@smuzi/http-server";
import {salesOrdersRouter} from "#sales_orders/http_routes/index.js";
import {env, Some, path, HttpProtocol} from "@smuzi/std";
import {zohoOAuthRouter} from "@crmoz/zoho-oauth";
import { zohoOAuthConfig } from "./zoho_oauth.js";

const router = CreateHttp1Router({path: ''});
router.group(salesOrdersRouter);
router.group(zohoOAuthRouter(zohoOAuthConfig).http1());

export const httpServerConfig = buildHttp1ServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('80'))),
    router,
});
