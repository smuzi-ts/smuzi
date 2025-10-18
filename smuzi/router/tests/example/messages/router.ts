import {CreateRouter, Index} from "#lib/index.ts";
import * as Actions from "./actions";


export const router = CreateRouter({path: "messages"});

router.get("", Actions.list);
router.post("", Actions.create);
router.get("/{id}", Actions.find);
router.put("/{id}", Actions.update);
