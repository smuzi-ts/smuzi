import { env, path, Some, HttpProtocol, buildHttpUrl, dump, None } from "@smuzi/std";
import { CreateHttpRouter, http2ServerRun, HttpServer, buildHttpServerConfig } from "@smuzi/http-server";
import { faker } from "@smuzi/faker";
import { pipelineTests } from "@smuzi/tests";

let server: HttpServer;

const router = CreateHttpRouter({path: ''});

const serverConfig = buildHttpServerConfig({
    host: env("APP_HOST", Some("localhost")),
    port: parseInt(env("APP_PORT", Some('81'))),
    router,
});

export const serverEndpoint = buildHttpUrl(serverConfig.protocol, serverConfig.host, Some(serverConfig.port));

router.get('users', () => {
    return faker.repeat(10, () => ({
        name: faker.string(),
        age: faker.number(),
        role: {
            title: faker.array.getItem(['admin','client']),
        }
    }));
})


server = (await http2ServerRun(serverConfig)).unwrap();

const pipelineTest = new TestPipeline<unknown>([

])

export async function teardown() {
  await server.close();
}
