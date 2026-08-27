import {CreateHttp1Router} from "@smuzi/http-server";
import {shopifyRouter} from "./shopify.js";

export const salesOrdersRouter = CreateHttp1Router({path: 'sales_orders'});

salesOrdersRouter.group(shopifyRouter);