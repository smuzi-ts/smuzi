import os from 'node:os';
// const { PerformanceObserver } = require('node:perf_hooks');
// // Create a performance observer
// const obs = new PerformanceObserver(list => {
//     const entry = list.getEntries()[0];
//     /*
//     The entry is an instance of PerformanceEntry containing
//     metrics of a single garbage collection event.
//     For example:
//     PerformanceEntry {
//       name: 'gc',
//       entryType: 'gc',
//       startTime: 2820.567669,
//       duration: 1.315709,
//       kind: 1
//     }
//     */
// });
// // Subscribe to notifications of GCs
// obs.observe({ entryTypes: ['gc'] });
// // Stop subscription
// obs.disconnect();
//

let len = 1_000_00;
const entries = new Set();
function addEntry() {
    const entry = {
        timestamp: Date.now(),
        memory: os.freemem(),
        totalMemory: os.totalmem(),
        uptime: os.uptime(),
    };
    entries.add(entry);
}
function summary() {
    console.log(`Total: ${entries.size} entries`);
}
// execution
(() => {
    while (len > 0) {
        addEntry();
        process.stdout.write(`~~> ${len} entries to record\r`);
        len--;
    }
    summary();
})();