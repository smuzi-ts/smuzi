import {assert, describe, it} from "@jis/tests";
import {Exception} from "#lib/prelude.js";

describe("Errors-Exception", () => {
    it("Function", () => {
        try {
            const b = () => {
                throw new Exception('test');
            }
            const c = () => b();
            c();
        } catch (exception) {
            if (exception instanceof Exception) {
                assert.strEndsWith(exception.file, 'exception.test.js');
                assert.isInteger(exception.line);
                assert.isInteger(exception.column);
                assert.strContains(exception.stack, 'exception.test.js');
                assert.equal(exception.function, 'b');
            }
        }
    })

    it("Class method", () => {
        try {
            class ExTest {
                method1() {
                    throw new Exception('test');
                }
            }
            const c = () => {
                const t = new ExTest()
                t.method1();
            };
            c();
        } catch (exception) {
            if (exception instanceof Exception) {
                assert.strEndsWith(exception.file, 'exception.test.js');
                assert.isInteger(exception.line);
                assert.isInteger(exception.column);
                assert.strContains(exception.stack, 'exception.test.js');
                assert.equal(exception.method, 'method1');
                assert.equal(exception.typeName, 'ExTest');
            }
        }
    })

})
