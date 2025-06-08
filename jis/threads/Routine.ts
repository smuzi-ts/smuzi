import { fileURLToPath } from 'node:url';
import {Worker, isMainThread} from "node:worker_threads";
import * as fs from 'fs';
import {relativeToUrl} from "@jis/std/path";
import {pipeIn} from "@jis/std/fn";

const worker = new Worker(relativeToUrl(import.meta.url, "./worker/worker.js"));

worker.on('message', (inputMsg) => {

    const taskId = inputMsg.taskId ?? null;

    if (taskId != null && balancer.tasks.has(taskId)) {

        const taskPromise = balancer.tasks.get(taskId);
        if (inputMsg.result.isOk === true) {
            taskPromise.resolve(inputMsg.result);
        } else {
            const err = inputMsg.result ?? new Error(`Error is undefined for
             taskId = ${inputMsg.taskId}
             script path = ${taskPromise.path}
             method = ${taskPromise.method}`)

            taskPromise.reject(err);
        }


        balancer.tasks.delete(taskId);
    }
});

worker.on('error', (error) => console.log('Worker Error', error))

worker.on('exit', (code) => {
    if (code !== 0)
        console.log(`Worker stopped with exit code ${code}`);
});


const balancer = {
    taskId: 1,
    tasks: new Map(),
    workers: []
}

const getFreeWorker = () => {
    return worker;
}

const runRoutine = async (path, method, args) => {
    const taskId = balancer.taskId++;

    return new Promise((resolve, reject) => {
        balancer.tasks.set(taskId, {path, method, resolve, reject})
        getFreeWorker().postMessage({taskId, path, method, args})
    });
}

const BTransformModule = <M>(module: M, runInMainThread: boolean = false) =>
    (path: string): M => {
        if (! isMainThread || runInMainThread) return module;

        for (const method in module) {
            if (typeof module[method] !== 'function') continue;
            // @ts-ignore
            module[method] = (...args) => runRoutine(path, method, args);
        }

        return module;
    }


const existsModule = (path: string): string => {
    if (! fs.existsSync(path)) {
        throw new Error(`File ${path} is not exists`)
    }

    return path;
}

export const Routine = <M>(url: string, module: M, runInMainThread = false): M => {
    const transformModuleConcrete = BTransformModule(module, runInMainThread);

    return pipeIn(url)(fileURLToPath, existsModule, transformModuleConcrete);
}