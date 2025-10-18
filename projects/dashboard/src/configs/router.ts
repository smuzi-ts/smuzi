import {CreateRouter} from "@smuzi/router";
import {router as users} from "#users/routes/index.ts";

export const router = CreateRouter({path: ''});

router.group(users);