import {dump, None, Option} from "@smuzi/std";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

export type RequestConfig = {
    method: HttpMethod;
    headers: Option<Record<string, string>>;
    query: Option<Record<string, string | number | boolean>>;
    body: Option<unknown>;
};

export type HttpResponse<T = unknown> = {
    ok: boolean;
    status: number;
    statusText: string;
    data: T;
    headers: [];
};

function buildUrl(baseUrl: Option<string>, url: string, query: Option<Record<string, string | number | boolean>>) {
    const fullUrl = baseUrl.someOr("") + url;

    return query.match({
        None: () => fullUrl,
        Some: (query) => {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) {
                params.append(key, String(value));
            }
            const qs = params.toString();
            return qs ? `${fullUrl}?${qs}` : fullUrl;
        }
    })


}

export type HttpClientConfig = {
    baseUrl?: Option<string>
    baseHeaders?: Option<Record<string, string>>
}


export function buildHttpClient({baseUrl = None(), baseHeaders = None()}: HttpClientConfig = {}){

    async function request<T = unknown>(url: string, config: RequestConfig): Promise<HttpResponse<T>> {
        const {
            method = HttpMethod.GET,
            headers = {},
            query,
            body,
            rawResponse = false,
        } = config;

        const finalUrl = buildUrl(baseUrl, url, config.query);

        const init: RequestInit = {
        method,
        headers: {
            Accept: "application/json",
            ...headers,
        },
    };

    if (body !== undefined && method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
        if (typeof body === "object" && !(body instanceof FormData)) {
            init.headers = { "Content-Type": "application/json", ...init.headers };
            init.body = JSON.stringify(body);
        } else {
            init.body = body as any;
        }
    }

    try {
        const response = await fetch(finalUrl, init);
    let data: any;
    if (rawResponse) {
        data = await response.text();
    } else {
        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
            data = await response.json().catch(() => null);
        } else {
            data = await response.text();
        }
    }

    if (! response.ok) {
        throw new Error(
            `HTTP error ${response.status}: ${response.statusText}\n${JSON.stringify(data)}`
        );
    }

    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: data as T,
        headers: [],
    };

} catch(e) {
        console.log("OPAAA");
        console.log(e);
      return {
        ok: false,
        status: 500,
        statusText: e,
        data: e,
        headers: []
    };
    }
}

    return {

    get<T = unknown>(url, config: Omit<RequestConfig, "method" | "body"> = { query: None(), headers: None() }) {
        return request<T>(url, { ...config, method: HttpMethod.GET });
    },
}
}
