import {CreateRouter} from "@smuzi/router";
import {router as users} from "#users/routes/index.ts";

//Base application router
export const router = CreateRouter({path: ''});

router.group(users);