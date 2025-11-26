import { pipelineTest } from "@smuzi/tests";
import { http1ServerRun, StdHttp1Server } from "@smuzi/http-server";
import { Some} from "@smuzi/std";
import { serverConfig } from "./config.js";
import getCases from "./get.js"
import { log } from "console";

type GlobalSetup = {
    server: StdHttp1Server
}

export default () => pipelineTest<GlobalSetup>({
    beforeGlobal: Some(async () => {
        return {
             server: (await http1ServerRun(serverConfig)).unwrap()
        };
    }
    ),
    afterGlobal: Some(async (globalSetup) => {
        log(globalSetup);
        await globalSetup.unwrap().server.close();
    }),
    descibes: [
        getCases
    ]
})