import {Option, HttpProtocol, None} from "@smuzi/std";
import {Http1Router} from "#lib/router.js";

type Cert = Option<{
        key: string,
        cert: string,
    }>

type Http1BaseServerConfig = {
    host: string;
    port: number,
    router: Http1Router,
    cert?: Cert
}

export type Http1ServerConfig = Http1BaseServerConfig & {
    cert: Cert,
    protocol: HttpProtocol,
}

export function buildHttp1ServerConfig({host, port, router, cert = None()}: Http1BaseServerConfig): Http1ServerConfig {
    return {
        host, 
        port,
        router,
        cert,
        protocol: cert.someOrNone(HttpProtocol.HTTPS, HttpProtocol.HTTP)
    };
};

type Http2BaseServerConfig = {
    host: string;
    port: number,
    router: Http1Router,
    cert?: Cert
}

export type Http2ServerConfig = Http1BaseServerConfig & {
    cert: Cert,
    protocol: HttpProtocol,
}

export function buildHttp2ServerConfig({host, port, router, cert = None()}: Http2BaseServerConfig): Http2ServerConfig {
    return {
        host, 
        port,
        router,
        cert,
        protocol: cert.someOrNone(HttpProtocol.HTTPS, HttpProtocol.HTTP)
    };
};