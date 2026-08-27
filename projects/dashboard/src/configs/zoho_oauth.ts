import { env, HttpProtocol, Some, url } from "@smuzi/std";
import { OAuthConfig , scopes, domains, PostgresOAuthRepository } from "@crmoz/zoho-oauth"
import { databaseConfig } from "./database.js";

export const zohoOAuthConfig: OAuthConfig = {
    connection: Some("zoho"),
    protocol: HttpProtocol.HTTP,
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    path: "zoho/oauth/",
    scopes,
    domains,
    full_path: "",
    repository: new PostgresOAuthRepository("zoho_oauth_credentials", databaseConfig.default.client),
}

zohoOAuthConfig.full_path = url.resolve(
    zohoOAuthConfig.protocol, 
    zohoOAuthConfig.host, 
    zohoOAuthConfig.port, 
    zohoOAuthConfig.path,
);