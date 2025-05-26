import test from 'node:test';
import { ConsoleLogger } from './ConsoleLogger.ts';

test('ConsoleLogger.debug выводит правильное сообщение', (test) => {
    const logs = [];
    const originalLog = console.log;

    console.log = (...args) => logs.push(args.join(' '));

    try {
        const logger = new ConsoleLogger();
        logger.debug('Message from test');

        test.assert.strictEqual(logs.length, 1);
        test.assert.strictEqual(logs[0], 'Message from test');
    } finally {
        console.log = originalLog;
    }
});