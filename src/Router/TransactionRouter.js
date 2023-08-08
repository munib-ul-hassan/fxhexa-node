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
  TransactionRouters.route("/Coin").post(
    TransactionController.buyCoin
  );
  
  TransactionRouters.route("/sellCoin").post(
    TransactionController.sellCoin
  );
  
  TransactionRouters.route("/getTransactions").get(
    TransactionController.getTransactions
  );

})
