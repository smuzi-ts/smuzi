import { testRunner } from "@smuzi/tests";
import { http1ServerRun, StdHttp1Server } from "@smuzi/http-server";
import { Some} from "@smuzi/std";
import { serverConfig } from "./config/config.js";

type GlobalSetup = {
    server: StdHttp1Server
}


export default async () => testRunner<GlobalSetup>({
    folder: './tests/http1',
    beforeGlobal: Some(async () => {
        return {
             server: (await http1ServerRun(serverConfig)).unwrap()
        };
    }
    ),
    afterGlobal: Some(async (globalSetup) => {
        await globalSetup.unwrap().server.close();
    }),
});