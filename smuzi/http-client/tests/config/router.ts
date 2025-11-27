import { HttpResponse } from "@smuzi/std";
import { CreateHttpRouter } from "@smuzi/http-server";
import { faker } from "@smuzi/faker";
import { apiConfig } from "./config.js";


const router = CreateHttpRouter({ path: '' });
const usersRouter = CreateHttpRouter({ path: 'users/' });
usersRouter.get("list", () => {
    return faker.repeat(5, () => ({
        id: faker.integer(),
        name: faker.string(),
        email: faker.string(),
    }))
})

usersRouter.get("auth", (context) => {
    if (context.request.query.get("token") == apiConfig.key) {
        return new HttpResponse({
            status: 200,
            statusText: "Authorized"
        })
    }

    return new HttpResponse({
        status: 401,
        statusText: "Unauthorized"
    })
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