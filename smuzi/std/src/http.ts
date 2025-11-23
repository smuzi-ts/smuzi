import { Option,None } from "#lib/option.js";

export function buildHttpUrl(protocol: HttpProtocol, host: string, port: Option<number> = None()) {
    return `${protocol}://${host}` + port.match({Some: v => ":" + v, None: () => ""});
}

export enum HttpProtocol {
    HTTPS = "https",
    HTTP = "http",
}
