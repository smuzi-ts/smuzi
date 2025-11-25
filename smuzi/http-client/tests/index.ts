import { pipelineTest } from "@smuzi/tests";
import { CreateHttpRouter, http2ServerRun, HttpServer, buildHttpServerConfig } from "@smuzi/http-server";
import { Some, env, buildHttpUrl} from "@smuzi/std";
import { serverConfig } from "./config.js";

pipelineTest({
    beforeGlobal: Some(async () => {
        return {
            (await http2ServerRun(serverConfig)).unwrap();
    }),
    afterGlobal: Some(async () => {
        
    }),
    descibes: []
})