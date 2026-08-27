import {CreateHttp1Router} from "@smuzi/http-server";

export const shopifyRouter = CreateHttp1Router({path: 'shopify/'});

shopifyRouter.post('create', function (ctx) {
    console.log(ctx)
    return 'users.index';
});
