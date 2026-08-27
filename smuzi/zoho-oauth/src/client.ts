import {buildHttpClient} from "@smuzi/http-client";

export const zohoOAuthClient = (baseUrl: string) => buildHttpClient({
    baseUrl,
});