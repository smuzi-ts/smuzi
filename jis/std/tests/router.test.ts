import {assert, describe, it, okMsg} from "@jis/tests";
import {Route, HttpMethod} from "#std/router.ts";

describe("Std-Router", () => {

    it(okMsg("Matched"), () => {
        let routes = new Map();
        routes.set([HttpMethod.GET, "test"], () => console.log('[HttpMethod.GET, "test"]'));
        routes.set([HttpMethod.GET, "prod"], () => console.log('[HttpMethod.GET, "prod"]'));
        routes.set([HttpMethod.POST, "save"], () => console.log('[HttpMethod.POST, "save"]'));

        let route = new Route({method: HttpMethod.GET, path: "test"});

        const resultMatch = route.match(routes, 404);

        assert.equal(resultMatch, "Success!!!")
    })
})