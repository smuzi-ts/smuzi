import "./globals.js";
import {http2ServerRun} from '@smuzi/http-server';
import {httpServerConfig} from "#configs/server.js";

const server = await http2ServerRun(httpServerConfig)
