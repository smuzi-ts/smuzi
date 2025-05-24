import * as http2 from "node:http2";
import * as fs from "node:fs";
import {isFunction, isString} from "#stdlib/checks";
import {createContext} from "./context.js";
import {IRouteHandler} from "#juravel/server/declare";

export function startServer(
    {
        port,
        certificateKeyPath,
        certificateCertPath,
    },
    routesHandler = IRouteHandler,
) {
    const server = http2.createSecureServer({
            key: fs.readFileSync(certificateKeyPath),
            cert: fs.readFileSync(certificateCertPath),
    });

    server.on('stream', (stream, headers) => {

        const context = createContext(
            headers,
        )

        routesHandler(context, stream);

        stream.on('error', (err) => {
            throw new Error("Crash server")
        });

        if (isString(response)) {
            stream.respond({
                'content-type': 'text/json',
                ':status': 200,
            });

            stream.end(response)
        }

    });

    console.log('Run server on: https://localhost:' + port)

    server.listen(port);
}
