import { assert, describe, errMsg, it, skip, okMsg } from "@jis/tests";
import { StringValue, MapStringPatterns } from "#std/string_value.ts";


describe("Std-StringValue", () => {
    it(okMsg("Matched to string"), () => {
        let routes = MapStringPatterns([
            ["GET", () => "find"],
            ["POST", () => "save"],
            [["PUT", "PATCH"], () => "update"],
        ]);
        let method = "GET";
        let handler = StringValue(method);
        let response = handler.match(routes, (v) => "Not found");

        assert.equal(response, "find")
    }),

        it(okMsg("Matched to array of strings"), () => {
            let routes = MapStringPatterns([
                ["GET", () => "find"],
                ["POST", () => "save"],
                [["PUT", "PATCH"], () => "update"],
            ]);
            let method = "PATCH";
            let handler = StringValue(method);
            let response = handler.match(routes, (v) => "Not found");

            assert.equal(response, "update")
        })

    it(okMsg("Not Matched to any values"), () => {
        let routes = MapStringPatterns([
            ["GET", () => "find"],
            ["POST", () => "save"],
            [["PUT", "PATCH"], () => "update"],
        ]); let method = "DELETE";
        let handler = StringValue(method);
        let response = handler.match(routes, (v) => "Not found");
        assert.equal(response, "Not found")
    })

    it(okMsg("Matched to regexp with named params"), () => {
        let routes = MapStringPatterns([
            ["user", () => "find"],
            [["save", "update"], () => "update"],
            [/^users\/(?<user_id>\d+)\/books\/(?<book_id>\d+)$/, (params) => params]
        ]);

        let path = "users/100/books/200";
        let handler = StringValue(path);
        let response = handler.match(routes, (v) => "Not found");

        assert.isOption(response);

        let expected = Object.create(null);
        expected.user_id = '100';
        expected.book_id = '200';

        assert.deepEqual(response.unwrap(), expected)
    })

        it(okMsg("Matched to regexp with unnamed params"), () => {
        let routes = MapStringPatterns([
            ["user", () => "find"],
            [["save", "update"], () => "update"],
            [/^users\/(\d+)\/books\/(\d+)$/, (params) => params]
        ]);

        let path = "users/100/books/200";
        let handler = StringValue(path);
        let response = handler.match(routes, (v) => "Not found");

        assert.isOption(response);
        assert.deepEqual(response.unwrap(), ['100', '200'])
    })

})
