import { Router, application } from "express";
import OrderController from "../Controller/OrderController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
export const OrderRouters = Router();

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(OrderRouters);
  this.use(path, middleware, OrderRouters);
  return OrderRouters;
};

OrderRouters.prefix("/Order", AuthMiddleware, async function () {
  OrderRouters.route("/open").post(
    OrderController.open
  );  
  OrderRouters.route("/close").post(
    OrderController.close
  );  
  OrderRouters.route("/getOrder").get(
    OrderController.getOrder
  );

})
