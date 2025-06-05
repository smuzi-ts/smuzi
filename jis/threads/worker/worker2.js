// worker.js
import { parentPort } from 'node:worker_threads';

parentPort.on('message', async (taskOptions) => {
    console.log('Worker get next taskOptions = ', taskOptions)
    const {path, method, args} = taskOptions
    const module = (await import(path)).default
    const result = module[method](...args);

    parentPort.postMessage(result)
});
