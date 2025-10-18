import { assert, describe, it, okMsg } from "@smuzi/tests";
import { CreateRouter, Method, SInputMessage} from "#lib/index.ts";
import { match, None } from "@smuzi/std";
import { router as messagesRouter } from "./messages/router";
import { router as  usersRouter } from "./users/router";

describe("Std-Router", () => {
    it(okMsg("Example"), () => {
        //Routing
        const router = CreateRouter();
        router.group(usersRouter);
        router.group(messagesRouter);

        //Preparing test requests
        const mapRequestResponse = new Map();
        mapRequestResponse.set({ path: "users", method: Method.GET}, "users list");
        mapRequestResponse.set({ path: "users", method: Method.POST}, "create user");
        mapRequestResponse.set({ path: "users/222", method: Method.GET}, "user find id=222");
        mapRequestResponse.set({ path: "users/222", method: Method.PUT}, "user update id=222");
        mapRequestResponse.set({ path: "messages", method: Method.GET}, "messages list");
        mapRequestResponse.set({ path: "messages", method: Method.POST}, "create message");
        mapRequestResponse.set({ path: "messages/333", method: Method.GET}, "message find id=333");
        mapRequestResponse.set({ path: "messages/333", method: Method.PUT}, "message update id=333");

        //Run tests
        for (const [request, exptextedResponse] of mapRequestResponse) {
            const actualResponse = match(new SInputMessage(request), router.getMapRoutes(), "not found")
            assert.equal(actualResponse, exptextedResponse);
        }
    
    });
})