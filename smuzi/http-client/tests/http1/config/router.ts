import { dump, HttpResponse } from "@smuzi/std";
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
    if (context.request.query.get("token") == apiConfig.key) {
        context.response.writeHead(200, "Authorized");
        context.response.end();
        return;
    }

    context.response.writeHead(401, "Unauthorized");
    context.response.end();
    return;
})

router.get("echoQuery", (context) => {
    return {
        a: context.request.query.get("a"),
        b: context.request.query.get("b"),
        c: context.request.query.get("c"),
    }
})

router.group(usersRouter);

export default router;