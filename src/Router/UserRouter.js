import { Router, application } from "express";
import AdminController from "../Controller/AdminController.js";
import UserController from "../Controller/UserController.js";
import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";
// import { handleMultipartData } from "../Utils/MultipartData.js";
// import { InstructorAuthMiddleware } from "./Middleware/AuthMiddleware.js";
// import { AuthMiddleware } from './Middleware/Auth.js'
export const UserRouters = Router();

// Request based apis

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(UserRouters);
  this.use(path, middleware, UserRouters);
  return UserRouters;
};
UserRouters.prefix("/user", AuthMiddleware, async function () {
  

  UserRouters.route("/privacy").get(AdminController.getPrivacy);
  UserRouters.route("/terms").get(AdminController.getTerms);
  UserRouters.route("/notification").get(UserController.getNotification);
  UserRouters.route("/delete").delete(UserController.deleteaccount);
  UserRouters.route("/me/:id").get(UserController.getMyProfile);

  


  



});
