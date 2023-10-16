import { Router, application } from "express";
import ForexController from "../Controller/ForexController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
export const ForexRouters = Router();



application.prefix = Router.prefix = function (path, middleware, configure) {
    configure(ForexRouters);
    this.use(path, middleware, ForexRouters);
    return ForexRouters;
  };
  ForexRouters.prefix("/forex", AuthMiddleware, async function () {
    ForexRouters.route("/get").get(
        ForexController.gettickers
      ); 
      ForexRouters.route("/graph").get(
        ForexController.getgraph
      );  
      ForexRouters.route("/open").post(
        ForexController.openforex
      );  
      ForexRouters.route("/close").post(
        ForexController.closeforex
      );  
      
  })



