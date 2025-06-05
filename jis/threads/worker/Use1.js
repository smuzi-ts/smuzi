import { Worker, parentPort } from 'node:worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const taskPath = path.join(__dirname, '../tasks/task1.js');

const worker = new Worker(path.join(__dirname, './worker.js'));

worker.on('message', (msg) => console.log('Worker Message', msg));
worker.on('error', (error) => console.log('Worker Error', error))
worker.on('exit', (code) => {
    if (code !== 0)
        console.log(`Worker stopped with exit code ${code}`);
});

const Task = (taskPath) => (...args) => {
    worker.postMessage({taskPath, args,})
}

const task1 = Task(taskPath)


task1(2, 4)