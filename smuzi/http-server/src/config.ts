import {Option, HttpProtocol, None, HttpResponse, transformError, dump} from "@smuzi/std";
import {ActionErrorHandler, Context, Http1Router} from "./router.js";
import {ServerResponse} from "node:http";

type Cert = Option<{
        key: string,
        cert: string,
    }>

export type Http1ServerConfig = {
    host: string;
    port: number,
    router: Http1Router,
    cert: Cert,
    protocol: HttpProtocol,
    errorHandler: ActionErrorHandler<ServerResponse>
}

type InputHttp1ServerConfig = Partial<Http1ServerConfig> & {
    router: Http1Router,
}

function http1ErrorHandler(context: Context<ServerResponse>, error) {
    //TODO: write error to log and remove dump()
    dump({msg: "http1ErrorHandler", error})
    return HttpResponse.asJson({error:"Internal Server Error"}, 500);
}

export function buildHttp1ServerConfig({host = 'localhost', port = 8080, router, cert = None(), errorHandler = http1ErrorHandler}: InputHttp1ServerConfig): Http1ServerConfig {
    return {
        host, 
        port,
        router,
        cert,
        protocol: cert.someOrNone(HttpProtocol.HTTPS, HttpProtocol.HTTP),
        errorHandler,
    };
};

type Http2BaseServerConfig = {
    host: string;
    port: number,
    router: Http1Router,
    cert?: Cert
}

export type Http2ServerConfig = Http2BaseServerConfig & {
    cert: Cert,
    protocol: HttpProtocol,
}

export function buildHttp2ServerConfig({host, port, router, cert = None() }: Http2BaseServerConfig): Http2ServerConfig {
    return {
        host, 
        port,
        router,
        cert,
        protocol: cert.someOrNone(HttpProtocol.HTTPS, HttpProtocol.HTTP)
    };
};