// worker.js
import { parentPort } from 'node:worker_threads';

parentPort.on('message', async (taskOptions) => {
    console.log('Worker get next taskOptions = ', taskOptions)
    const {taskPath, args} = taskOptions
    const task = (await import(taskPath)).default
    const result = task(...args)
    parentPort.postMessage(result)
});
