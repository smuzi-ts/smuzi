import { log } from "console";

export enum HttpMethod {
    GET,
    POST,
} 

export class Route<M extends HttpMethod, P extends string> {
    protected _method: M;
    protected _path: P;

    constructor(details: {method: M, path: P })
    {
        this._method = details.method;
        this._path = details.path;
    }

    match<H extends Map<[HttpMethod, string], unknown>>(m: H, _: unknown): unknown {
        let key: [M, P] = [this._method, this._path];

        log("key", key)
        log("m", m)
        log("has", m.has(key))

        if (m.has(key)) {
            return m.get(key)
        }

        return _
    }
}

