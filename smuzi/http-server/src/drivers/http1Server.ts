import http, { IncomingMessage, ServerResponse } from 'node:http';
import https from 'node:https';
import { TLSSocket } from 'node:tls';
import fs from 'node:fs';

import { methodFromString } from "#lib/router.js";
import {
    isArray,
    isObject,
    isString,
    match,
    StdRecord,
    matchUnknown,
    OptionFromNullable,
    Some,
    Result,
    Option,
    Err,
    Ok,
    isNull,
    transformError,
    StdError,
    dump,
    HttpResponse,
    HttpRequest,
    StdMap,
    isSome,
    isOption,
    isResult,
    isIterable,
    ResponseHttpHeaders, RequestHttpHeaders, asList, asRecord, asMap, querystring, QueryParams,
    StdJson, uuid
} from '@smuzi/std';
import { HttpServer, HttpServerRunError, Http1ServerConfig } from "#lib/index.js";
import { log } from 'node:console';

type NativeServer = any

export class StdHttp1Server implements HttpServer {
    readonly #server: NativeServer

    constructor(server: NativeServer) {
        this.#server = server;
    }
    async close(): Promise<Result<boolean, StdError>> {
        return new Promise(resolve => {
            this.#server.close((err) => {
                return resolve(isNull(err) ? Ok(true) : Err(transformError(err)));
            })
        })
    }
}

function readRequestBodyAsBuffer(req: IncomingMessage): () => Promise<Result<Buffer, Error>> {
    return async () => {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];

            req.on("data", (chunk) => {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            });

            req.on("end", () => {
                resolve(Ok(Buffer.concat(chunks)));
            });

            req.on("error", (err) => reject(Err(err)));
        });
    }
}

function readRequestJson(req: IncomingMessage): <T>() => Promise<Result<Option<T>, StdError>> {
    return async(encoding: BufferEncoding = "utf-8") => {
        return new Promise((resolve) => {
        let body = "";

        req.setEncoding(encoding);

        req.on("data", (chunk: string) => {
            body += chunk;
        });

        req.on("end", () => {
            resolve(StdJson.fromString(body));
        });

        req.on("error", (err) => resolve(Err(transformError(err))));
    });
    }
}

function readRequestInput(req: IncomingMessage): <T extends StdRecord<QueryParams>>() => Promise<Result<T, StdError>> {
    return async(encoding: BufferEncoding = "utf-8") => {
        return new Promise((resolve) => {
            let body = "";

            req.setEncoding(encoding);

            req.on("data", (chunk: string) => {
                body += chunk;
            });

            req.on("end", () => {
                resolve(querystring.fromString(body));
            });

            req.on("error", (err) => resolve(Err(transformError(err))));
        });
    }
}

function readRawBody(req: IncomingMessage): <T>() => Promise<Result<string, StdError>> {
    return async(encoding: BufferEncoding = "utf-8") => {
        return new Promise((resolve) => {
            let body = "";

            req.setEncoding(encoding);

            req.on("data", (chunk: string) => {
                body += chunk;
            });

            req.on("end", () => {
                resolve(Ok(body));
            });

            req.on("error", (err) => resolve(Err(transformError(err))));
        });
    }
}

let COUNTER = 0;

export async function http1ServerRun(config: Http1ServerConfig): Promise<Result<StdHttp1Server, HttpServerRunError>> {
    return new Promise((resolve) => {
        async function handler(nativeRequest: IncomingMessage, nativeResponse: ServerResponse) {
            const methodStr = OptionFromNullable(nativeRequest.method).unwrap();
            const fullUrl = nativeRequest.url || "/";
            const isHttps = nativeRequest.socket instanceof TLSSocket;
            const urlObj = new URL(fullUrl, (isHttps ? "http" : "https") + `://${nativeRequest.headers.host}`);
            const path = OptionFromNullable(urlObj.pathname).unwrap();
            const request = {
                path:  path.replace(/^\//, '').replace(/\/$/, ''),
                method: methodFromString(methodStr).unwrap(`Error: undefined http method '${methodStr}'`),
            };
            
            const routeMatched = config.router.match(request);

            let context = {
                request: new HttpRequest({
                    method: request.method,
                    path: request.path,
                    query: () => new StdRecord<QueryParams>(Object.fromEntries(urlObj.searchParams.entries())),
                    headers: new RequestHttpHeaders(nativeRequest.headers as any),
                    buffer: readRequestBodyAsBuffer(nativeRequest),
                    body: readRawBody(nativeRequest),
                    json: readRequestJson(nativeRequest),
                    form: readRequestInput(nativeRequest),
                }),
                response: nativeResponse,
                pathParams: routeMatched.pathParams,
            };

            let response;
            try {
                response = await routeMatched.action(context)
            } catch (error) {
                response = await config.errorHandler(context, error);
            }


            if (isOption(response)) {
                response = response.someOr("");
            } else if(isResult(response)) {
                response = response.unsafeSource();
            }

            if (isNull(response)) {
                return;
            }

            const handlers = new Map();
            
            handlers.set(resp => isString(resp) || resp instanceof Buffer, (response) => {
                nativeResponse.writeHead(200, {
                    "Content-Type": "text/html; charset=utf-8",
                });
                nativeResponse.end(response);
            });

            handlers.set(resp => resp instanceof HttpResponse, (response: HttpResponse) => {
                nativeResponse.statusCode = response.status;
                nativeResponse.statusMessage = response.statusText;
                nativeResponse.setHeaders(response.headers.unsafeSource());
                nativeResponse.end(response.body.someOr(""));
            });

            handlers.set(resp => resp instanceof StdError, (error: StdError) => {
                nativeResponse.statusCode = 500;
                nativeResponse.statusMessage = error.message;
                nativeResponse.end(error.message);
            });

            handlers.set(
                (response) => isObject(response) || isArray(response) || asList(response) || asRecord(response) || asMap(response),
                (response) => {
                    //TODO: return respons on top instead of changed nativeResponse inner
                    nativeResponse.setHeader("Content-Type", "application/json; charset=utf-8" );

                    try {
                        const resp = StdJson.toString(response).match({
                            Ok: (jsonStr) => ({status: 200, body: jsonStr }),
                            Err: (err) => ({status: 500 , body: '{"error":"Internal Server Error"}' }),
                        });
                        nativeResponse.statusCode = resp.status;
                        nativeResponse.end(resp.body);
                    } catch (err) {
                        nativeResponse.statusCode = 500;
                        nativeResponse.end('{"error":"Internal Server Error"}');
                    }
                }
            );


            matchUnknown(response, handlers, () => {
                nativeResponse.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
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
            log("Server started on", nativeError);
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
            log("Server started on " + config.protocol + "://" + config.host + ":" + config.port)

            resolve(Ok(new StdHttp1Server(server)));
        });

    });
}