import { loadDescribesFromDir, pipelineTest } from "@smuzi/tests";
import { http1ServerRun, StdHttp1Server } from "@smuzi/http-server";
import { Some} from "@smuzi/std";
import { serverConfig } from "./config/config.js";

type GlobalSetup = {
    server: StdHttp1Server
}

export default async () => pipelineTest<GlobalSetup>({
    beforeGlobal: Some(async () => {
        return {
             server: (await http1ServerRun(serverConfig)).unwrap()
        };
    }
    ),
    afterGlobal: Some(async (globalSetup) => {
        await globalSetup.unwrap().server.close();
    }),
    descibes: await loadDescribesFromDir('./tests/http1')
})