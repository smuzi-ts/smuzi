import { dump, HttpResponse, Option, RequestHttpHeaders } from "@smuzi/std";
import { CreateHttp1Router } from "@smuzi/http-server";
import { faker } from "@smuzi/faker";
import { apiConfig } from "./config.js";


const router = CreateHttp1Router({ path: '' });

const usersRouter = CreateHttp1Router({ path: 'users/' });
usersRouter.get("list", () => {
    return faker.repeat(5, () => ({
        id: faker.integer(),
        name: faker.string(),
        email: faker.string(),
    }))
})

usersRouter.get("auth", (context) => {
    const token = context.request.query.get("token").someOr("");

    if (token != apiConfig.key) {
        context.response.writeHead(401, "Unauthorized");
        context.response.end();
        return;
    }
    
    context.response.writeHead(200, "Authorized");
    context.response.end();
})

usersRouter.get("authHeader", (context) => {
    const token = context.request.headers.getOther("x-token").someOr("");

    if (token != apiConfig.key) {
        context.response.writeHead(401, "Unauthorized");
        context.response.end();
        return;
    }
    
    context.response.writeHead(200, "Authorized");
    context.response.end();
})

router.get("echoQuery", (context) => {
    const resp = {};
    for(const [key, val] of context.request.query) {
        resp[key] = val.someOr("");
    }
    return resp;
})

router.get("echoHeaders", (context) => {
   const resp = new HttpResponse();
    for(const [key, val] of context.request.headers) {
        if (key.endsWith("custom")) {
            resp.headers.setOther(key, val.someOr(""));
        }
    }
    return resp;
})

router.post("echoBodyString", (context) => {
    return context.;
})

router.group(usersRouter);

export default router;