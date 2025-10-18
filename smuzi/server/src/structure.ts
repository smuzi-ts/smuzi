import {impl, Struct} from "@smuzi/std";
import {Index} from "@smuzi/router";

export enum HttpProtocol {
    HTTPS = "https",
    HTTP = "http",
}

export type TConfigServer = {
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

export const ConfigServer = Struct<TConfigServer>();

impl(ServerUrl, ConfigServer, {
    getUrl() {
        return `${this.protocol}://${this.host}` + (this.port ? (':' + this.port) : '');
    },
});