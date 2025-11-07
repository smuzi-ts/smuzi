import {assert, assertionError, describe, errMsg, it, okMsg, skip} from "@smuzi/tests";
import { Pipe } from "#lib/pipeline.js";
import {faker} from "@smuzi/faker";
import {json} from "#lib/json.js";
import {None, Some} from "#lib/option.js";

describe("Std-json", () => {

    it(okMsg("fromString - deep"), () => {
        const name= faker.string();
        const inputString = `{"data": [{"id":1,"name": null}, {"id":2,"name": "${name}"}]}`;
        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (obj) => {
                assert.deepEqual(obj, {"data": [{"id": 1,"name": None()}, {"id":2,"name": name}]});
            },
        })
    })

    it(okMsg("fromString - string"), () => {
        const value = faker.string();
        const inputString= `"${value}"`;
        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.equal(actual, value);
            },
        })
    })

    it(okMsg("fromString - number"), () => {
        const value = faker.number();
        const result = json.fromString(String(value));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.equal(actual, value);
            },
        })
    })

    it(okMsg("fromString - boolean"), () => {
        const value = 'true';
        const result = json.fromString(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.equal(actual, true);
            },
        })
    })

    it(okMsg("fromString - nullable"), () => {
        const value = 'null';
        const result = json.fromString(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.equalNone(actual);
            },
        })
    })


    it(errMsg("fromString - bad json"), () => {
        const inputString = '{"name":"' + faker.string() + '", "email": "' + faker.string() + '"/}';
        const result = json.fromString(inputString);

        result.match({
            Ok: (val) => {
                assert.fail("Expected Err result, but get Ok");
            },
            Err(err){
                assert.string.contains(err.message, "Expected ',' or '}' after property value in JSON at position")
            }
        })
    })

    it(okMsg("toString - deep"), () => {
        const name= faker.string();
        const obj = {"data": [{"id": 1,"name": None()}, {"id":2,"name": name}]};
        const result = json.toString(obj);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (jsonStr) => {
                assert.equal(jsonStr,`{"data":[{"id":1,"name":null},{"id":2,"name":"${name}"}]}`);
            },
        })
    })

    it(errMsg("toString - string value"), () => {
        const value = faker.string();
        const result = json.toString(value);

        result.match({
            Ok: (actual) => {
                assert.equal(actual, `"${value}"`);
            },
            Err: error => assert.fail(error.message),
        })
    })
})