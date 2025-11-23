import {CreateHttpRouter} from "@smuzi/http-server";

export const router = CreateHttpRouter({path: 'users/'});

router.get('index', function (ctx) {
    console.log(ctx)
    return 'users.index';
});

router.get('create', function (ctx) {
    return 'users.create';
});