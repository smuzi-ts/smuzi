import { dump, Err, json, None, Ok, Option, OptionFromNullable, Result, HttpMethod, HttpResponse, RequestHttpHeaders, ResponseHttpHeaders, isObject, isNull, asNull, StdError, isNone, asString } from "@smuzi/std";

export type BaseRequestConfig = {
    method: HttpMethod;
    headers: RequestHttpHeaders;
    query: Record<string, string | number | boolean>;
    body: Option;
    rawResponse: boolean
};

export type GetRequestConfig = {
    headers?: RequestHttpHeaders;
    query?: Record<string, string | number | boolean>;
    rawResponse?: boolean
};

export type PostRequestConfig = {
    headers?: RequestHttpHeaders;
    query?: Record<string, string | number | boolean>;
    body?: Option,
    rawResponse?: boolean
};

function buildUrl(baseUrl: string = "", url: string, query: Record<string, string | number | boolean>) {
    const fullUrl = baseUrl + url;
    let qs = "";

    for (const [key, value] of Object.entries(query)) {
        qs += key + "=" + value + "&";
    }

    return qs ? `${fullUrl}?${qs.slice(0, -1)}` : fullUrl;
}

export type HttpClientConfig = {
    baseUrl?: string
    baseHeaders?: Record<string, string>
}

export function buildHttpClient({ baseUrl = "", baseHeaders = {} }: HttpClientConfig = {}) {

    async function request<T = unknown, E = unknown>(url: string, config: BaseRequestConfig): Promise<Result<HttpResponse<T>, HttpResponse<E> | StdError>> {
        const {
            method = HttpMethod.GET,
            headers,
            query,
            body,
            rawResponse = false,
        } = config;

        const finalUrl = buildUrl(baseUrl, url, config.query);

        const requestInit: RequestInit = {
            method,
        }; 

        if (method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
            const bodyParsed: Option<{
                body: string,
                contentType: string
            }> = body.mapSome((body) => {

                if (isObject(body) && !(body instanceof FormData)) {
                    return {
                        body: json.toString(body).unwrap(),
                        contentType: "application/json; charset=utf-8"
                    }
                }

                //TODO SAFE: "body as string", need to added any chekers
                return {
                        body: asNull(body) ? "" : body as string,
                        contentType: "text/plain; charset=utf-8"
                }
            });

            if (! bodyParsed.isNone()) {
                requestInit.body = bodyParsed.unwrapByKey("body");
                headers.set("content-type", bodyParsed.unwrapByKey("contentType"));
            }

        }

        requestInit.headers = headers.unsafeSource();

        try {
            const response = await fetch(finalUrl, requestInit);
            const responseContentType = response.headers.get("content-type") ?? "";

            try {
                const body = OptionFromNullable(await response.text())
                    .mapSome((rawData) => {
                        if (rawResponse) {
                            return rawData;
                        }

                        if (! responseContentType.includes("application/json")) {
                            return rawData;
                        }

                        return json.fromString(rawData).unwrap();
                    }).flat();

                if (!response.ok) {
                    return Err(new HttpResponse({
                        status: response.status,
                        statusText: response.statusText,
                        body: body as Option<E>,
                        headers: ResponseHttpHeaders.fromHeaders(response.headers)
                    }))
                }

                return Ok(new HttpResponse({
                    status: response.status,
                    statusText: response.statusText,
                    body: body as Option<T>,
                    headers: ResponseHttpHeaders.fromHeaders(response.headers)
                }));

            } catch (e) {
                return Err(e);
            }

        } catch (err) {
            return Err(err);
        }
    }

    return {
        get<T = unknown>(url, { query = {}, headers = new RequestHttpHeaders, rawResponse = false }: GetRequestConfig = {}) {
            return request<T>(url, { query, headers, rawResponse, method: HttpMethod.GET, body: None() });
        },
        post<T = unknown>(url, { query = {}, headers = new RequestHttpHeaders, body = None(), rawResponse = false }: PostRequestConfig = {}) {
            return request<T>(url, { query, headers, rawResponse, method: HttpMethod.POST, body });
        },
    }
}
