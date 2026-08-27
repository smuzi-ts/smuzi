import {CreateHttp1Router, Http1Router} from "@smuzi/http-server";
import {ssrEngine} from "@smuzi/ssr";
import {zohoOAuthScopes} from "#lib/scopes/index.js";
import {domains} from "#lib/domains.js";
import {
    HttpResponse,
    None,
    Ok,
    querystring,
    Some,
} from "@smuzi/std";

import {schema} from "@smuzi/schema";
import {ZohoOAuthSetting, zohoOAuthSettingSchema} from "#lib/credentials.js";
import {zohoOAuthClient} from "#lib/client.js";

const ssr = ssrEngine();
let clientId = None();
let clientSecret = None();

export const zohoOAuthRouter = {
    http1(): Http1Router {
        const router = CreateHttp1Router({path: 'zoho/oauth/'}, () => {
            return "not found"
        });

        router.get("init", async () => {
            return await ssr.response("init", {
                scopes: zohoOAuthScopes,
                domains
            });
        })

        router.post("get_auth_code", async (context) => {
            return (await context.request.form<ZohoOAuthSetting>())
                .okThen(creds => {
                    return zohoOAuthSettingSchema.validate(creds).mapOk(() => creds)
                })
                .okThen(creds => {
                    clientId = creds.get("clientId");
                    clientSecret = creds.get("clientSecret");

                    const query = querystring.toString({
                        scope: creds.get("scopes").unwrap(),
                        client_id: clientId.unwrap(),
                        response_type: 'code',
                        access_type: 'offline',
                        prompt: 'consent',
                        redirect_uri: 'http://localhost:8445/zoho/oauth/get_auth_token',
                    })

                    const url = creds.get('domain').unwrap() + '/oauth/v2/auth?' + query.unwrap();

                    return Ok(HttpResponse.asRedirect(url))
                });
        })

        router.get("get_auth_token", async (context) => {
            return schema.map(schema.string(), schema.record({
                code: schema.string(),
                location: schema.string(),
            }))
                .validate(context.request.query()).mapOk(() => {
                    zohoOAuthClient(context.request.query().get("location").unwrap() as string)
                        .post("/oauth/v2/token", { body: Some(querystring.toString({
                                client_id: clientId.unwrap(),
                                client_secret: clientSecret.unwrap(),
                                grant_type: "authorization_code",
                                redirect_uri:  'http://localhost:8445/zoho/oauth/get_auth_token',
                                code: context.request.query().get('code')
                            }))})
                })
        })

        return router;
    }
}
