import test from 'node:test';
import assert from 'node:assert';
import { ConsoleLogger } from './ConsoleLogger.ts';

test('ConsoleLogger.debug выводит правильное сообщение', (t) => {
    const logs = [];
    const originalLog = console.log;

    console.debug = (...args) => logs.push(args.join(' '));

    try {
        const logger = new ConsoleLogger();
        logger.debug('Message from test');

        t.assert.strictEqual(logs.length, 1);
        t.assert.strictEqual(logs[0], 'Message from test');
    } finally {
        console.log = originalLog; // Восстановим оригинальный лог
    }
});