import {assert, errMsg, it, okMsg} from "@smuzi/tests";
import {faker} from "@smuzi/faker";
import {json} from "#lib/json.js";
import {None, Some} from "#lib/option.js";
import {Err, Ok} from "#lib/result.js";
import {StdRecord} from "#lib/record.js";
import {StdList} from "#lib/list.js";
import {testRunner} from "./index.js";

testRunner.describe("Std-json", [
    it("fromString-deep", () => {
        type User = StdRecord<{
            id: number,
            name: string,
            post: StdRecord<{title: string}>
        }>;

        type UserData = StdRecord<{
            data: StdList<User>,
        }>
        const inputString = `{"data": [{"id":1,"name": "333", "post":{"title":"Subject"}}, {"id":2,"name": "2222", "post":{"title":"Subject2"}}]}`;
        const resultJSON = json.fromString<UserData>(inputString)
            .unwrap() //Possible JSON parse error
            .unwrap() //Possible empty JSON;

        const data = resultJSON
            .get("data")
            .unwrap(); //Possible empty data

        const first = data.get(0).unwrap() //Possible first element is empty
        const firstId = first.get("id").unwrap();
        const firstTitle= first.get("post")
            .unwrap()
            .get("title")
            .unwrap();

        assert.equal(firstId, 1);
        assert.equal(firstTitle, "Subject");

    }),

    it("fromString - obj with key as ''", () => {
        type Obj = StdRecord<{
            "": number,
        }>
        const value =`{"":1}`
        const result = json.fromString<Obj>(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual.unwrap().get("").unwrap(), 1);
            },
        })
    }),

    it(okMsg("fromString - string"), () => {
        const value = faker.string();
        const inputString = `"${value}"`;
        const result = json.fromString<string>(inputString);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual.unwrap(), value);
            },
        })
    }),

    it(okMsg("fromString - number"), () => {
        const value = faker.number();
        const result = json.fromString<number>(String(value));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual.unwrap(), value);
            },
        })
    }),

    it(okMsg("fromString - boolean"), () => {
        const value = 'true';
        const result = json.fromString<boolean>(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.deepEqual(actual.unwrap(), true);
            },
        })
    }),

    it(okMsg("fromString - null"), () => {
        const value = 'null';
        const result = json.fromString<never>(value);

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (actual) => {
                assert.equalNone(actual);
            },
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
    }),
    it("toString - from Array", () => {
        const result = json.toString(["a", "b", "c"]);

        result.match({
            Ok: (actual) => {
                assert.equal(actual, `["a","b","c"]`);
            },
            Err: error => assert.fail(error.message),
        })
    }),
    it("toString - from Array with custom object properties", () => {
        const keys = ["a", "b", "c"];
        const arr: string[] = [];
        for(const key of keys) {
            arr[key] = key;
        }

        const result = json.toString(arr);

        result.match({
            Ok: (actual) => {
                assert.equal(actual, `[]`);
            },
            Err: error => assert.fail(error.message),
        })
    }),
    it("fromString-toString-flow", () => {
        type User = StdRecord<{
            id: number,
            name: string,
            post: StdRecord<{title: string}>
        }>;

        type UserData = StdRecord<{
            data: StdList<User>,
        }>
        const inputString = `{"data":[{"id":1,"name":"333","post":{"title":"Subject"}},{"id":2,"name":"2222","post":{"title":"Subject2"}}]}`;
        const resultJSON = json.fromString<UserData>(inputString)
            .unwrap() //Possible JSON parse error
            .unwrap();

        const outputString = json.toString(resultJSON);
        assert.equal(outputString.unwrap(), inputString);
    }),
])