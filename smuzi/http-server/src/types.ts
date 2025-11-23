import { Option, Result, StdError } from "@smuzi/std";

export interface HttpServer {
     close(): Promise<Result<boolean, StdError>>
}

export type HttpServerRunError = {
    errno: Option<number>,
    code: Option<string>,
    syscall: Option<string>,
    path: Option<string>,
    port: Option<string>,
    address: Option<string>,
};