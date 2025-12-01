import { dump, Err, json, None, Ok, Option, OptionFromNullable, Result, HttpMethod, HttpResponse, RequestHttpHeaders, ResponseHttpHeaders } from "@smuzi/std";

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

    async function request<T = unknown, E = unknown>(url: string, config: BaseRequestConfig): Promise<Result<HttpResponse<T>, HttpResponse<E>>> {
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
            headers: headers.unsafeSource(),
        };

        if (method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
            const bodyParsed = body.mapSome((body) => {
                if (typeof body === "object" && !(body instanceof FormData)) {
                    const jsonString = json.toString(body);
                    if (jsonString.isErr()) {
                        return jsonString.mapErr(err => {
                            return new HttpResponse({
                                status: 1000,
                                statusText: err.message,
                            })
                        })
                    }
                }
            })
        }

        try {
            const response = await fetch(finalUrl, requestInit);
            const responseContentType = response.headers.get("Content-Type") ?? "";

            try {
                const data = OptionFromNullable(await response.text())
                    .mapSome((rawData) => {
                        if (rawResponse) {
                            return rawData;
                        }

                        if (!responseContentType.includes("application/json")) {
                            return rawData;
                        }

                        return json.fromString(rawData).errThen((err) => {
                            throw new HttpResponse({
                                status: 1200,
                                statusText: err.message,
                            },);
                        })
                    })
                    .flat()

                if (!response.ok) {
                    return Err(new HttpResponse({
                        status: response.status,
                        statusText: response.statusText,
                        data: data as Option<E>,
                        headers: ResponseHttpHeaders.fromHeaders(response.headers)
                    }))
                }

                return Ok(new HttpResponse({
                    status: response.status,
                    statusText: response.statusText,
                    data: data as Option<T>,
                    headers: ResponseHttpHeaders.fromHeaders(response.headers)
                }));

            } catch (e) {
                return Err(e);
            }

        } catch (e) {
            return Err(new HttpResponse({
                status: 500,
                statusText: e,
            }));
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
