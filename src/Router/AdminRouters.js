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


// AdminRouters.route("/coins").post(AdminController.createcoins);
// AdminRouters.route("/coins").get(AdminController.getcoins);
// AdminRouters.route("/coins/:id").put(AdminController.updatecoins);
// AdminRouters.route("/coins/:id").delete(AdminController.deletecoins);

AdminRouters.route("/payment").get(AdminController.getPayments);

AdminRouters.prefix("/admin", AdminMiddleware, async function () {
  AdminRouters.route("/updateUser").post(AdminController.Updateuser);

  // AdminRouters.route("/sendNotification").post(AdminController.sendNotification);
  
  AdminRouters.route("/user").get(AdminController.getUsers);
  
  AdminRouters.route("/userbyid").get(AdminController.getUserById);

  AdminRouters.route("/privacy").post(AdminController.createPrivacy);
  AdminRouters.route("/privacy").get(AdminController.getPrivacy);
  AdminRouters.route("/privacy/:id").put(AdminController.updatePrivacy);
  AdminRouters.route("/privacy/:id").delete(AdminController.deletePrivacy);

  AdminRouters.route("/payment").post(AdminController.createPayments);
  AdminRouters.route("/payment/:id").put(AdminController.updatePayments);
  AdminRouters.route("/payment/:id").delete(AdminController.deletePayments);
  AdminRouters.route("/terms").post(AdminController.createTerms);
  AdminRouters.route("/terms").get(AdminController.getTerms);
  AdminRouters.route("/terms/:id").put(AdminController.updateTerms);
  AdminRouters.route("/terms/:id").delete(AdminController.deleteTerms);
  AdminRouters.route("/deleteuser/:id").post(AdminController.deleteUser);
  AdminRouters.route("/dashboard").get(AdminController.getdashboard);
  AdminRouters.route("/stocks").get(AdminController.getstocks);
  AdminRouters.route("/forex").get(AdminController.getforex);




});
