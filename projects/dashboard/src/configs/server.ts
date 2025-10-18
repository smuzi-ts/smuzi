import {ConfigServer, HttpProtocol} from "@smuzi/server";
import {router} from "#configs/router.ts";
import * as path from "node:path";

export const serverConfig = new ConfigServer({
    protocol: HttpProtocol.HTTPS,
    host: "localhost",
    port: 8443,
    router,
    cert: {
        key: path.join('ssl/', 'server.key'),
        cert: path.join('ssl/', 'server.crt'),
    }
});