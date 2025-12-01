import { Option, None, Some, OptionFromNullable } from "#lib/option.js";
import { match } from "#lib/match.js";
import { StdRecord } from "./record.js";
import { StdMap } from "./map.js";

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


function buildUrl(protocol: HttpProtocol, host: string, port: Option<number> = None()) {
    return `${protocol}://${host}` + port.match({Some: v => ":" + v, None: () => ""});
}

function methodFromString(method: string): Option<HttpMethod> {
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

export class HttpResponse<D = unknown> {
    readonly status: number;
    readonly statusText: string;
    readonly data: Option<D>;
    readonly headers: ResponseHttpHeaders;

    constructor({ status = 200, statusText = "", data = None(), headers = new ResponseHttpHeaders }: {
        status?: number;
        statusText?: string;
        data?: Option<D>;
        headers?: ResponseHttpHeaders;
    } = {}) {
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.headers = headers;
    }
}

export type HttpQuery = StdMap<string, string | string[]>

export class HttpRequest {
    readonly path: string;
    readonly method: HttpMethod;
    readonly query: HttpQuery
    readonly headers: RequestHttpHeaders;

    constructor({ method, path, query = new StdMap, headers = new RequestHttpHeaders}: {
        path: string;
        method: HttpMethod;
        query?: HttpQuery;
        headers?: RequestHttpHeaders;
    }) {
        this.path = path;
        this.method = method;
        this.query = query;
        this.headers = headers;
    }
}

type RequestHeaderKeys =
  | "accept"
  | "accept-encoding"
  | "accept-language"
  | "accept-patch"
  | "accept-ranges"
  | "access-control-allow-credentials"
  | "access-control-allow-headers"
  | "access-control-allow-methods"
  | "access-control-allow-origin"
  | "access-control-expose-headers"
  | "access-control-max-age"
  | "access-control-request-headers"
  | "access-control-request-method"
  | "age"
  | "allow"
  | "alt-svc"
  | "authorization"
  | "cache-control"
  | "connection"
  | "content-disposition"
  | "content-encoding"
  | "content-language"
  | "content-length"
  | "content-location"
  | "content-range"
  | "content-type"
  | "cookie"
  | "date"
  | "etag"
  | "expect"
  | "expires"
  | "forwarded"
  | "from"
  | "host"
  | "if-match"
  | "if-modified-since"
  | "if-none-match"
  | "if-unmodified-since"
  | "last-modified"
  | "location"
  | "origin"
  | "pragma"
  | "proxy-authenticate"
  | "proxy-authorization"
  | "public-key-pins"
  | "range"
  | "referer"
  | "retry-after"
  | "sec-fetch-site"
  | "sec-fetch-mode"
  | "sec-fetch-user"
  | "sec-fetch-dest"
  | "sec-websocket-accept"
  | "sec-websocket-extensions"
  | "sec-websocket-key"
  | "sec-websocket-protocol"
  | "sec-websocket-version"
  | "set-cookie"
  | "strict-transport-security"
  | "tk"
  | "trailer"
  | "transfer-encoding"
  | "upgrade"
  | "user-agent"
  | "vary"
  | "via"
  | "warning"
  | "www-authenticate";


export class RequestHttpHeaders extends StdRecord<RequestHeaderKeys, string> {}
export class ClientHttpHeaders extends StdRecord<RequestHeaderKeys, string> {}

type ResponseHeaderKeys =
  | "accept"
  | "accept-charset"
  | "accept-encoding"
  | "accept-language"
  | "accept-ranges"
  | "access-control-allow-credentials"
  | "access-control-allow-headers"
  | "access-control-allow-methods"
  | "access-control-allow-origin"
  | "access-control-expose-headers"
  | "access-control-max-age"
  | "access-control-request-headers"
  | "access-control-request-method"
  | "age"
  | "allow"
  | "authorization"
  | "cache-control"
  | "cdn-cache-control"
  | "connection"
  | "content-disposition"
  | "content-encoding"
  | "content-language"
  | "content-length"
  | "content-location"
  | "content-range"
  | "content-security-policy"
  | "content-security-policy-report-only"
  | "content-type"
  | "cookie"
  | "dav"
  | "dnt"
  | "date"
  | "etag"
  | "expect"
  | "expires"
  | "forwarded"
  | "from"
  | "host"
  | "if-match"
  | "if-modified-since"
  | "if-none-match"
  | "if-range"
  | "if-unmodified-since"
  | "last-modified"
  | "link"
  | "location"
  | "max-forwards"
  | "origin"
  | "pragma"
  | "proxy-authenticate"
  | "proxy-authorization"
  | "public-key-pins"
  | "public-key-pins-report-only"
  | "range"
  | "referer"
  | "referrer-policy"
  | "refresh"
  | "retry-after"
  | "sec-websocket-accept"
  | "sec-websocket-extensions"
  | "sec-websocket-key"
  | "sec-websocket-protocol"
  | "sec-websocket-version"
  | "server"
  | "set-cookie"
  | "strict-transport-security"
  | "te"
  | "trailer"
  | "transfer-encoding"
  | "user-agent"
  | "upgrade"
  | "upgrade-insecure-requests"
  | "vary"
  | "via"
  | "warning"
  | "www-authenticate"
  | "x-content-type-options"
  | "x-dns-prefetch-control"
  | "x-frame-options"
  | "x-xss-protection";


export class ResponseHttpHeaders extends StdRecord<ResponseHeaderKeys, string> {
    static fromHeaders(entries: Headers) {
        return new ResponseHttpHeaders((Object.fromEntries((entries as any).entries())) as Record<ResponseHeaderKeys, string>);
    }
}

export const http = {
    methodFromString,
    buildUrl,
}