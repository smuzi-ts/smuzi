import { Router } from "#lib/router.ts";
import * as Actions from "./actions";

export function messagesRouter(router: Router) {
    router.get("", Actions.list);
    router.post("", Actions.create);
    router.get("/{id}", Actions.find);
    router.put("/{id}", Actions.update);

    return router
}