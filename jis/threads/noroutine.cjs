const noroutine = require('noroutine');
const task2 = require('./tasks/task2.cjs');

noroutine.init({
    modules: [task2],
    pool: 5, // number of workers in thread pool
    wait: 2000, // maximum delay to wait for a free thread
    timeout: 5000, // maximum timeout for executing a functions
    monitoring: 5000, // event loop utilization monitoring interval
});

(async () => {
    const res1 = await task2.m1('value1');

    console.log({ res1 });
})();
