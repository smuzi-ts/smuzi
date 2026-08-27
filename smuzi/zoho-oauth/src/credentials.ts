import {schema} from "@smuzi/schema";

export const zohoOAuthSettingSchema = schema.record({
    clientId:  schema.string(),
    clientSecret:  schema.string(),
    domain: schema.string(),
    scopes: schema.list(schema.string()),
});

export type ZohoOAuthSetting = typeof zohoOAuthSettingSchema.__infer;

