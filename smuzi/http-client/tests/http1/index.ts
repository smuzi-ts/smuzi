import {TestRunner} from "@smuzi/tests";
import { http1ServerRun, StdHttp1Server } from "@smuzi/http-server";
import {Option, Some} from "@smuzi/std";
import { serverConfig } from "./config/config.js";

type GlobalSetup = Option<{
    server: StdHttp1Server
}>

export const http1TestRunner = new TestRunner<GlobalSetup>({
    folder: './tests/http1',
    beforeGlobal: Some(async () => {
        return Some({
             server: (await http1ServerRun(serverConfig)).unwrap()
        });
    }
    ),
    afterGlobal: Some(async (globalSetup) => {
        await globalSetup.unwrap().server.close();
    }),
});

export default async () => http1TestRunner.run();