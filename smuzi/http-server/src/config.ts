import {Option, HttpProtocol, None} from "@smuzi/std";
import {Router} from "#lib/router.js";

type Cert = Option<{
        key: string,
        cert: string,
    }>

type BaseServerConfig = {
    host: string;
    port: number,
    router: Router,
    cert?: Cert
}

export  type ServerConfig = BaseServerConfig & {
    cert: Cert,
    protocol: HttpProtocol,
}

export function buildHttpServerConfig({host, port, router, cert = None()}: BaseServerConfig): ServerConfig {
    return {
        host, 
        port,
        router,
        cert,
        protocol: cert.mapOr(HttpProtocol.HTTPS, HttpProtocol.HTTP)
    };
};