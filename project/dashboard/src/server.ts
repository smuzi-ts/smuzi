import http2, { IncomingHttpHeaders, ServerHttp2Stream } from 'node:http2';
import fs from 'node:fs';
import path from 'node:path';
import { type Context, CreateRouter, methodFromString, SInputMessage, } from "@smuzi/router";
import { isArray, isObject, isString, match, matchUnknown, Pipe } from '@smuzi/std';
import { log } from 'node:console';

const server = http2.createSecureServer({
  key: fs.readFileSync(path.resolve('ssl/server.key')),
  cert: fs.readFileSync(path.resolve('ssl/server.crt')),
});

server.on('stream', (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {

  const methodStr = headers[':method'];
  const path = headers[':path'].replace(/^\//, '').replace(/\/$/, '');;

  const request = {
    path: path,
    method: methodFromString(methodStr).unwrap(`Error: undefined http method '${methodStr}'`),
  };

  console.log(`Incoming request: ${request.method} ${request.path}`);

  const router = CreateRouter();

  router.get("users", (context: Context) => {
    return "Route = users list";
  });
  

  router.get("json", (context: Context) => {
    return { name: "den" };
  });

    router.get("array", (context: Context) => {
    return [1,2,3];
  });

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

server.listen(8443, () => {
  console.log('HTTP/2 server running at https://localhost:8443');
});
