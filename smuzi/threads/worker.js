// worker.js
import { parentPort, threadId} from 'node:worker_threads';

parentPort.on('message', async (taskOptions) => {
    console.log(`Worker ${threadId} get new task with options`, taskOptions)
    let result = {
        isOk: false,
        value: undefined,
    };

    const {taskId, path, method, args} = taskOptions

    try {
        const module = (await import(path)).default;
        result.value = await module[method](...args, true);
        result.isOk = true;
    } catch (e) {
        result.value = e;
    } finally {
        parentPort.postMessage({threadId, taskId, result})
    }
});
