import { fileURLToPath } from 'node:url';
import {Worker, isMainThread, isInternalThread} from "node:worker_threads";
import * as path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const worker = new Worker(path.join(__dirname, './worker/worker2.js'));

worker.on('message', (msg) => console.log('Worker Message', msg));
worker.on('error', (error) => console.log('Worker Error', error))
worker.on('exit', (code) => {
    if (code !== 0)
        console.log(`Worker stopped with exit code ${code}`);
});

const run = (path, method, args) => {
    worker.postMessage({path, method, args})
}

const transformModule = <M extends Record<string, any>>(path, module: M): M => {
    for (const method in module) {
        if (typeof module[method] !== 'function') {
            continue;
        }
        module[method] = (...args)=> run(path, method, args);
    }

    return module;
}

export const Task = <M>(url, module: M): M => {
    if (isMainThread) {
        return module;
    }

    return transformModule(fileURLToPath(url), module);
}