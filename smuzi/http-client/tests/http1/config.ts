import { env, Some, buildHttpUrl, dump } from "@smuzi/std";
import { CreateHttpRouter, buildHttpServerConfig } from "@smuzi/http-server";
import { faker } from "@smuzi/faker";

const router = CreateHttpRouter({ path: '' });
const usersRouter = CreateHttpRouter({ path: 'users' });
usersRouter.get("/list", () => {
    return faker.repeat(5, () => ({
        id: faker.integer(),
        name: faker.string(),
        email: faker.string(),
    }))
})

router.group(usersRouter);

dump(usersRouter.getMapRoutes());

export const serverConfig = buildHttpServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    router,
});

export const serverEndpoint = buildHttpUrl(serverConfig.protocol, serverConfig.host, Some(serverConfig.port));