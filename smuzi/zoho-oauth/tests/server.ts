import {dump, main, Some, transformError} from "@smuzi/std";
import {http1ServerRun} from "@smuzi/http-server";
import {serverConfig} from "./config.js";
import * as process from "node:process";

main(
    async () => {
        const runResult = (await http1ServerRun(serverConfig));

        runResult.match({
            Err: err => {
                dump(err)
                process.exit(err.errno.someOr(1));
            },
            Ok: server => {
                dump({msg: "Server is run", serverConfig})
            }
        })

        return Some(runResult);
    },

    async (err, server) => {
        dump(err)
        process.exit(1);
    })
