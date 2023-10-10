
import { Router, application } from "express";
import StockController from "../Controller/stocksController.js";

export const StockRouters = Router();

application.prefix = Router.prefix = function (path, middleware, configure) {
    configure(StockRouters);
    this.use(path, middleware, StockRouters);
    return StockRouters;
};
StockRouters.route("/stock").get(
    StockController.getrealTimeData
);
StockRouters.route("/stocklist").get(
    StockController.getStocks
);
// StockRouters.route("/getExchanges").get(
//     StockController.getExchanges
// );