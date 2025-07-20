import { fileURLToPath } from 'node:url';
import {Worker, isMainThread} from "node:worker_threads";
import * as fs from 'fs';
import {relativeToUrl} from "@smuzi/std/path";
import {pipeIn} from "@smuzi/std/fn";

const worker = new Worker(relativeToUrl(import.meta.url, "./worker.js"));

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
    workers: new Map(),
}

const elu = worker.performance.eventLoopUtilization();


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