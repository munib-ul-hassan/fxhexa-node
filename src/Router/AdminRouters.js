import { Router, application } from "express";
import AdminController from "../Controller/AdminController.js";
import { AdminMiddleware, AuthMiddleware } from "./Middleware/AuthMiddleware.js";
// import { handleMultipartData } from "../Utils/MultipartData.js";
// import { InstructorAuthMiddleware } from "./Middleware/AuthMiddleware.js";
// import { AuthMiddleware } from './Middleware/Auth.js'
export const AdminRouters = Router();

// Request based apis

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(AdminRouters);
  this.use(path, middleware, AdminRouters);
  return AdminRouters;
};

AdminRouters.route("/admin/login").post(AdminController.Adminlogin);
AdminRouters.route("/user").get(AdminController.getUsers);


AdminRouters.prefix("/admin", AdminMiddleware, async function () {

  // AdminRouters.route("/sendNotification").post(AdminController.sendNotification);
  
  AdminRouters.route("/user").get(AdminController.getUsers);
  AdminRouters.route("/privacy").post(AdminController.createPrivacy);
  AdminRouters.route("/privacy").get(AdminController.getPrivacy);
  AdminRouters.route("/privacy/:id").put(AdminController.updatePrivacy);
  AdminRouters.route("/privacy/:id").delete(AdminController.deletePrivacy);
  AdminRouters.route("/terms").post(AdminController.createTerms);
  AdminRouters.route("/terms").get(AdminController.getTerms);
  AdminRouters.route("/terms/:id").put(AdminController.updateTerms);
  AdminRouters.route("/terms/:id").delete(AdminController.deleteTerms);
  AdminRouters.route("/deleteuser/:id").post(AdminController.deleteUser);
  AdminRouters.route("/dashboard").get(AdminController.getdashboard);






});
