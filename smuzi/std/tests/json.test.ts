import {assert, assertionError, describe, errMsg, it, okMsg} from "@smuzi/tests";
import {faker} from "@smuzi/faker";
import {json} from "#lib/json.js";
import {None, Some} from "#lib/option.js";
import {Err, Ok} from "#lib/result.js";



export default describe("Std-json", [
    it(okMsg("fromString - deep"), () => {
        const name = faker.string();
        const inputString = `{"data": [{"id":1,"name": null}, {"id":2,"name": "${name}"}]}`;
        const result = json.fromString(inputString);
        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (obj) => {
                const expectedObj = Some({
                    "data": Some([
                        Some({"id": Some(1), "name": None()}),
                        Some({"id": Some(2), "name": Some(name)}),
                    ])
                });

                assert.deepEqual(obj, expectedObj);
            }
        })
    }),

    it(okMsg("fromString - string"), () => {
        const value = faker.string();
        const inputString = `"${value}"`;
        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual, Some(value));
            },
        })
    }),

    it(okMsg("fromString - number"), () => {
        const value = faker.number();
        const result = json.fromString(String(value));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual, Some(value));
            },
        })
    }),

    it(okMsg("fromString - boolean"), () => {
        const value = 'true';
        const result = json.fromString(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual, Some(true));
            },
        })
    }),

    it(okMsg("fromString - nullable"), () => {
        const value = 'null';
        const result = json.fromString(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.equalNone(actual);
            },
        })
    }),
    it(okMsg("fromString - with Result Ok"), () => {
        const inputString = `{"data": [{"id":1,"name": null, "login": {"__type":"ok","val":true}}, {"id":2,"name": "user2"}]}`;

        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                const expectedObj = Some({
                    "data": Some([
                        Some({"id": Some(1), "name": None(), "login": Ok(Some(true))}),
                        Some({"id": Some(2), "name": Some("user2")}),
                    ])
                });

                assert.deepEqual(actual, expectedObj);            },
        })
    }),

    it(okMsg("fromString - with Result Err"), () => {
        const inputString = `{"data": [{"id":1,"name": null, "login": {"__type":"err","val":"Some Error"}}, {"id":2,"name": "user2"}]}`;

        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                const expectedObj = Some({
                    "data": Some([
                        Some({"id": Some(1), "name": None(), "login": Err(Some("Some Error"))}),
                        Some({"id": Some(2), "name": Some("user2")}),
                    ])
                });

                assert.deepEqual(actual, expectedObj);            },
        })
    }),

    it(okMsg("fromString - object with property '__type', but not Ok/Err"), () => {
        const inputString = `{"data": [{"id":1,"name": null, "login": {"__type":"custom","val":"custom val"}}, {"id":2,"name": "user2"}]}`;

        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                const expectedObj = Some({
                    "data": Some([
                        Some({"id": Some(1), "name": None(), "login": Some({"__type": Some("custom"), "val": Some("custom val")})}),
                        Some({"id": Some(2), "name": Some("user2")}),
                    ])
                });

                assert.deepEqual(actual, expectedObj);            },
        })
    }),

    it(okMsg("fromString - object with property '__type' equals Ok/Err, but property 'val' is not found"), () => {
        const inputString = `{"data": [{"id":1,"name": null, "login": {"__type":"ok","custom_val":"custom val"}}, {"id":2,"name": "user2"}]}`;

        const result = json.fromString(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                const expectedObj = Some({
                    "data": Some([
                        Some({"id": Some(1), "name": None(), "login": Some({"__type": Some("ok"), "custom_val": Some("custom val")})}),
                        Some({"id": Some(2), "name": Some("user2")}),
                    ])
                });

                assert.deepEqual(actual, expectedObj);            },
        })
    }),


    it(errMsg("fromString - bad json"), () => {
        const inputString = '{"name":"' + faker.string() + '", "email": "' + faker.string() + '"/}';
        const result = json.fromString(inputString);

        result.match({
            Ok: (val) => {
                assert.fail("Expected Err result, but get Ok");
            },
            Err(err) {
                assert.string.contains(err.message, "Expected ',' or '}' after property value in JSON at position")
            }
        })
    }),

    it(okMsg("toString - deep"), () => {
        const name = faker.string();
        const obj = {
            "data": [
                {"id": 1, "name": None()},
                {"id": 2, "name": Some(name)}
            ],
            "meta": Ok({"more_records": true})
        };
        const result = json.toString(obj);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (jsonStr) => {
                assert.equal(jsonStr, `{"data":[{"id":1,"name":null},{"id":2,"name":"${name}"}],"meta":{"__type":"ok","val":{"more_records":true}}}`);
            },
        })
    }),

    it(errMsg("toString - string value"), () => {
        const value = faker.string();
        const result = json.toString(value);

        result.match({
            Ok: (actual) => {
                assert.equal(actual, `"${value}"`);
            },
            Err: error => assert.fail(error.message),
        })
    }),

    it(errMsg("toString - Option value"), () => {
        const strVal = faker.string();
        const value = Some(strVal);

        const resultSome = json.toString(value);

        resultSome.match({
            Ok: (actual) => {
                assert.equal(actual, `"${strVal}"`);
            },
            Err: error => assert.fail(error.message),
        })

        const resultNone = json.toString(None());

        resultNone.match({
            Ok: (actual) => {
                assert.equal(actual, 'null');
            },
            Err: error => assert.fail(error.message),
        })
    }),

    it(errMsg("toString - null value"), () => {
        const result = json.toString(null);

        result.match({
            Ok: (actual) => {
                assert.equal(actual, 'null');
            },
            Err: error => assert.fail(error.message),
        })
    }),

    it(errMsg("toString - Result value"), () => {
        const strVal = faker.string();
        const valueOk = Ok(strVal);

        const resultOk = json.toString(valueOk);

        resultOk.match({
            Ok: (actual) => {
                assert.equal(actual, `{"__type":"ok","val":"${strVal}"}`);
            },
            Err: error => assert.fail(error.message),
        })

        const valueErr = Err(strVal);
        const resultErr = json.toString(valueErr);

        resultErr.match({
            Ok: (actual) => {
                assert.equal(actual, `{"__type":"err","val":"${strVal}"}`);
            },
            Err: error => assert.fail(error.message),
        })
    })
])