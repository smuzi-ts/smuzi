import http2, { IncomingHttpHeaders, ServerHttp2Stream } from 'node:http2';
import fs from 'node:fs';
import path from 'node:path';
import {type Context, CreateRouter, methodFromString, Router, SInputMessage,} from "@smuzi/router";
import { isArray, isObject, isString, match, matchUnknown } from '@smuzi/std';


export type Http2ConfigServer = {
    port: number,
    cert: {
        key: string,
        cert: string,
    }
};

export function Http2StrategyServer(config: Http2ConfigServer) {
    const server = http2.createSecureServer({
        key: fs.readFileSync(config.cert.key),
        cert: fs.readFileSync(config.cert.cert),
    });

    server.on('stream', (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {

        const methodStr = headers[':method'];
        const path = headers[':path'].replace(/^\//, '').replace(/\/$/, '');;

        const request = {
            path: path,
            method: methodFromString(methodStr).unwrap(`Error: undefined http method '${methodStr}'`),
        };

        console.log(`Incoming request: ${request.method} ${request.path}`);

        const response = match(new SInputMessage(request), router.getMapRoutes(), "not found")
        const handlers = new Map();


        handlers.set(isString, (response) => {
            stream.respond({
                'content-type': 'text/html; charset=utf-8',
                ':status': 200,
            });
            stream.end(response)
        });

        handlers.set(response => isObject(response) || isArray(response), (response) => {
            stream.respond({
                'content-type': 'application/json; charset=utf-8',
                ':status': 200,
            });

            stream.end(JSON.stringify(response));
        });


        matchUnknown(
            response,
            handlers,
            _ => {
                stream.respond({
                    ':status': 500,
                })
                stream.end('Internal Server Error');
            },
            false
        )

    });

    server.listen(config.port, () => {
        console.log('HTTP/2 server running at https://localhost:8443');
    });
}