import {CreateRouter} from "@smuzi/router";

export const router = CreateRouter({path: 'users/'});

router.get('index', function (ctx) {
    console.log(ctx)
    return 'users.index';
});

router.get('create', function (ctx) {
    return 'users.create';
});