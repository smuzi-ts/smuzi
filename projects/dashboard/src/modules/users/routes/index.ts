import {CreateHttp1Router} from "@smuzi/http-server";

export const router = CreateHttp1Router({path: 'users/'});

router.get('index', function (ctx) {
    console.log(ctx)
    return 'users.index';
});

router.get('create', function (ctx) {
    return 'users.create';
});