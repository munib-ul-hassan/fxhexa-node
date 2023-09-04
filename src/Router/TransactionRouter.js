import { Router, application } from "express";
import TransactionController from "../Controller/TransacionController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
export const TransactionRouters = Router();

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(TransactionRouters);
  this.use(path, middleware, TransactionRouters);
  return TransactionRouters;
};
TransactionRouters.prefix("/transaction", AuthMiddleware, async function () {
  TransactionRouters.route("/buy").post(
    TransactionController.purchase
  );  
  TransactionRouters.route("/sell").post(
    TransactionController.sell
  );  
  TransactionRouters.route("/getTransaction").get(
    TransactionController.getTransaction
  );

})
