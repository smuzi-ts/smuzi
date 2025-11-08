export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

export type RequestConfig = {
    method?: HttpMethod;
    headers?: Record<string, string>;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    signal?: AbortSignal;
    // если true — не парсить ответ как JSON
    rawResponse?: boolean;
};

export type HttpResponse<T = unknown> = {
    ok: boolean;
    status: number;
    statusText: string;
    data: T;
    headers: Headers;
};

function buildUrl(url: string, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) params.append(key, String(value));
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}

export const httpClient = {
    async request<T = unknown>(url: string, config: RequestConfig = {}): Promise<HttpResponse<T>> {
        const {
            method = HttpMethod.GET,
            headers = {},
            query,
            body,
            signal,
            rawResponse = false,
        } = config;

        const finalUrl = buildUrl(url, query);

        const init: RequestInit = {
            method,
            headers: {
                Accept: "application/json",
                ...headers,
            },
            signal,
        };

        if (body !== undefined && method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
            if (typeof body === "object" && !(body instanceof FormData)) {
                init.headers = { "Content-Type": "application/json", ...init.headers };
                init.body = JSON.stringify(body);
            } else {
                init.body = body as any;
            }
        }

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

        if (!response.ok) {
            throw new Error(
                `HTTP error ${response.status}: ${response.statusText}\n${JSON.stringify(data)}`
            );
        }

        return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            data: data as T,
            headers: response.headers,
        };
    },

    get<T = unknown>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
        return this.request<T>(url, { ...config, method: HttpMethod.GET });
    },

    post<T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
        return this.request<T>(url, { ...config, method: HttpMethod.POST, body });
    },

    put<T = unknown>(url: string, body?: unknown, config?: Omit<RequestConfig, "method" | "body">) {
        return this.request<T>(url, { ...config, method: HttpMethod.PUT, body });
    },

    delete<T = unknown>(url: string, config?: Omit<RequestConfig, "method" | "body">) {
        return this.request<T>(url, { ...config, method: HttpMethod.DELETE });
    },
};
