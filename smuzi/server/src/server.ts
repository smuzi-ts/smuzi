import http2, { IncomingHttpHeaders, ServerHttp2Stream } from 'node:http2';
import fs from 'node:fs';
import path from 'node:path';
import {type Context, CreateRouter, methodFromString, Router, SInputMessage,} from "@smuzi/router";
import { isArray, isObject, isString, match, matchUnknown } from '@smuzi/std';


export type OptionsServer = {
    port: number,
    cert: {
        key: string,
        cert: string,
    }
};

export * from Http2Strategies
