import {http1ServerRun} from '@smuzi/http-server';
import {httpServerConfig} from "#configs/server.js";
import {main} from "@smuzi/std";

main(async () => {
    await http1ServerRun(httpServerConfig)
})
