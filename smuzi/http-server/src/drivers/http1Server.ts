import http, { IncomingMessage, ServerResponse } from 'node:http';
import https from 'node:https';
import { TLSSocket } from 'node:tls';
import fs from 'node:fs';

import { methodFromString, SInputMessage, } from "#lib/router.js";
import { isArray, isObject, isString, json, match, matchUnknown, OptionFromNullable, buildHttpUrl, Some, Result, Option, Err, Ok, isNull, tranformError, StdError, dump } from '@smuzi/std';
import { HttpServer, HttpServerRunError, ServerConfig } from "#lib/index.js";

type NativeServer = any

export class StdHttp1Server implements HttpServer {
    readonly #server: NativeServer

    constructor(server: NativeServer) {
        this.#server = server;
    }
    async close(): Promise<Result<boolean, StdError>> {
        return new Promise(resolve => {
            this.#server.close((err) => {
                return resolve(isNull(err) ? Ok(true) : Err(tranformError(err)));
            })
        })
    }
}

export function http1ServerRun(config: ServerConfig): Promise<Result<any, HttpServerRunError>> {
    return new Promise((resolve) => {

        function handler(nativeRequest: IncomingMessage, nativeResponse: ServerResponse) {
            const methodStr = OptionFromNullable(nativeRequest.method).unwrap();
            const fullUrl = nativeRequest.url || "/";
            const isHttps = nativeRequest.socket instanceof TLSSocket;
            const pathname = new URL(fullUrl, (isHttps ? "http" : "https") + `://${nativeRequest.headers.host}`).pathname;
            const path = OptionFromNullable(pathname).unwrap();
            const request = {
                path:  path.replace(/^\//, '').replace(/\/$/, ''),
                method: methodFromString(methodStr).unwrap(`Error: undefined http method '${methodStr}'`),
            };

            console.log(`Incoming request: ${request.method} ${request.path}`);


            const response = match(new SInputMessage(request), config.router.getMapRoutes(), "not found")
            const handlers = new Map();
            
            handlers.set(isString, (response) => {
                nativeResponse.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                nativeResponse.end(response);
            });

            handlers.set(
                (response) => isObject(response) || isArray(response),
                (response) => {
                    //TODO: return respons on top instead of changed nativeResponse inner
                    nativeResponse.setHeader("Content-Type", "application/json; charset=utf-8" );
                    
                    try {
                        const resp = json.toString(response).match({
                            Ok: (jsonStr) => ({status: 200, data: jsonStr })
                                ,
                            Err: (err) => ({status: 500 , data: '{"error":"Internal Server Error"}' }),
                        });
                        nativeResponse.statusCode = resp.status;
                        nativeResponse.end(resp.data);
                    } catch (err) {
                        nativeResponse.statusCode = 500;
                        nativeResponse.end('{"error":"Internal Server Error"}');
                    }
                }
            );

            matchUnknown(response, handlers, () => {
                nativeResponse.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                nativeResponse.end("Internal Server Error");
            }, false);
        }

        const server = config.cert.match({
            Some: cert => {
                return https.createServer({
                    key: fs.readFileSync(cert.key),
                    cert: fs.readFileSync(cert.cert),
                }, handler);
            },
            None: () => {
                return http.createServer(handler);
            }
        })


        server.once('error', (nativeError: any) => {
            resolve(Err({
                errno: OptionFromNullable(nativeError.errno),
                code: OptionFromNullable(nativeError.code),
                syscall: OptionFromNullable(nativeError.syscall),
                path: OptionFromNullable(nativeError.path),
                port: OptionFromNullable(nativeError.port),
                address: OptionFromNullable(nativeError.address),
            }));
        });

        server.listen(config.port, () => {
            const httpUrl = buildHttpUrl(config.protocol, config.host, Some(config.port));
            console.log('HTTP/1.1 server running at ' + httpUrl);

            resolve(Ok(new StdHttp1Server(server)));
        });

    });
}