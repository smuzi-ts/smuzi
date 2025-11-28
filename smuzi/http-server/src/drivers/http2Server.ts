import http2, { Http2SecureServer, Http2Server, IncomingHttpHeaders, ServerHttp2Stream } from 'node:http2';
import fs from 'node:fs';

import { methodFromString } from "#lib/router.js";
import { isArray, isObject, isString, json, match, matchUnknown, OptionFromNullable, buildHttpUrl, Some, Result, Option, Err, Ok, isNull, tranformError, StdError, dump, HttpResponse } from '@smuzi/std';
import { HttpServer, HttpServerRunError, ServerConfig } from "#lib/index.js";

type NativeServer = Http2SecureServer | Http2Server;

export class StdHttp2Server implements HttpServer {
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

export function http2ServerRun(config: ServerConfig): Promise<Result<StdHttp2Server, HttpServerRunError>> {
    return new Promise((resolve) => {

        const server = config.cert.match({
            Some: cert => {
                return http2.createSecureServer({
                    key: fs.readFileSync(cert.key),
                    cert: fs.readFileSync(cert.cert),
                });
            },
            None: () => {
                return http2.createServer();
            }
        })


        server.once('error', (nativeError) => {
            resolve(Err({
                errno: OptionFromNullable(nativeError.errno),
                code: OptionFromNullable(nativeError.code),
                syscall: OptionFromNullable(nativeError.syscall),
                path: OptionFromNullable(nativeError.path),
                port: OptionFromNullable(nativeError.port),
                address: OptionFromNullable(nativeError.address),
            }));
        });

        server.on('stream', (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
            const methodStr = OptionFromNullable(headers[':method']).unwrap();
            const path = OptionFromNullable(headers[':path']).unwrap().replace(/^\//, '').replace(/\/$/, '');
            const urlObj = new URL(path, `http://${headers[':authority']}`);

            const request = {
                path: path,
                method: methodFromString(methodStr).unwrap(`Error: undefined http method '${methodStr}'`),
                query: urlObj.searchParams,
            };

            const response = config.router.match(request)
            const handlers = new Map();


            handlers.set(isString, (response) => {
                stream.respond({
                    'content-type': 'text/html; charset=utf-8',
                    ':status': 200,
                });
                stream.end(response)
            });

            handlers.set(resp => resp instanceof HttpResponse, (response: HttpResponse) => {
                stream.respond({
                    'content-type': 'application/json; charset=utf-8',
                    ':status': response.status,
                    
                });
            });
            


            handlers.set(response => isObject(response) || isArray(response), (response) => {
                stream.respond({
                    'content-type': 'application/json; charset=utf-8',
                    ':status': 200,
                });

                stream.end(json.toString(response).match({
                    Ok: (json) => json,
                    Err: (err) => {
                        stream.respond({
                            'content-type': 'application/json; charset=utf-8',
                            ':status': 500,
                        });

                        return `{"error":"Internal Server Error"}`;
                    }
                }));

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
            resolve(Ok(new StdHttp2Server(server)));
        });

    });
}