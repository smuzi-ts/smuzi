import {impl, Struct} from "@smuzi/std";
import {Index} from "@smuzi/router";

export enum HttpProtocol {
    HTTPS = "https",
    HTTP = "http",
}

export type TServerConfig = {
    host: string;
    protocol: HttpProtocol,
    port: number,
    cert?: {
        key: string,
        cert: string,
    },
    router: Index,
};

export class ServerUrl {
    getUrl: () => string
}

export const ServerConfig = Struct<TServerConfig>();

impl(ServerUrl, ServerConfig, {
    getUrl() {
        return `${this.protocol}://${this.host}` + (this.port ? (':' + this.port) : '');
    },
});