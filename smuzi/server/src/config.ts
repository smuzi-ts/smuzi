import {impl, Struct, UrlTrait} from "@smuzi/std";
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

const StructServerConfig = Struct<TServerConfig>();

impl(UrlTrait, StructServerConfig, {
    getUrl() {
        return `${this.protocol}://${this.host}` + (this.port ? (':' + this.port) : '');
    },
});

export const ServerConfig = StructServerConfig;