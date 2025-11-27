import { Option,None, Some } from "#lib/option.js";
import { match } from "#lib/match.js";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

export enum HttpProtocol {
    HTTPS = "https",
    HTTP = "http",
}


export function buildHttpUrl(protocol: HttpProtocol, host: string, port: Option<number> = None()) {
    return `${protocol}://${host}` + port.match({Some: v => ":" + v, None: () => ""});
}

export function httpMethodFromString(method: string): Option<HttpMethod> {
    const handers = new Map<string, Option<HttpMethod>>([
        ['GET', Some(HttpMethod.GET)],
        ['POST', Some(HttpMethod.POST)],
        ['PUT', Some(HttpMethod.PUT)],
        ['DELETE', Some(HttpMethod.DELETE)],
    ]);

    return match(
        method,
        handers,
        None(),
        false
    );
}

export type HttpHeaders = Map<string, string | number>;

export class HttpResponse<D = unknown> {
    readonly status: number;
    readonly statusText: string;
    readonly data: Option<D>;
    readonly headers: HttpHeaders;

    constructor({ status = 200, statusText = "", data = None(), headers = new Map }: {
        status?: number;
        statusText?: string;
        data?: Option<D>;
        headers?: HttpHeaders;
    }) {
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.headers = headers;
    }
}