import { Router, application } from "express";
import AuthController from "../Controller/AuthController.js";

import { AuthMiddleware } from "./Middleware/AuthMiddleware.js";

export let AuthRouters = Router();

AuthRouters.route("/auth/signup").post(AuthController.registerUser);
AuthRouters.route("/auth/login").post(AuthController.LoginUser);
AuthRouters.route("/auth/forgetpassword").post(AuthController.ForgetPassword);

AuthRouters.route("/auth/verifyuser").post(AuthController.VerifyUser);

AuthRouters.route("/auth/resend").post(AuthController.resendOTP);
AuthRouters.route("/auth/subacc/login").post(AuthController.loginSub);

application.prefix = Router.prefix = function (path, middleware, configure) {
  configure(AuthRouters);
  this.use(path, middleware, AuthRouters);
  return AuthRouters;
};

AuthRouters.prefix("/auth", AuthMiddleware, async function () {
  AuthRouters.route("/resetpassword").post(AuthController.ResetPassword);
  AuthRouters.route("/verifyotp").post(AuthController.VerifyOtp);
  
  AuthRouters.route("/subacc").post(AuthController.addSubAcc);
  AuthRouters.route("/subacc").get(AuthController.getSubAcc);
  AuthRouters.route("/subacc/:id").put(AuthController.updateSubAcc);
  AuthRouters.route("/subacc/:id").delete(AuthController.deleteSubAc);
  
  AuthRouters.route("/refer").get(AuthController.getreferlist);



  // AuthRouters.route("/updateprofile").post(AuthController.UpdateProfile);
  AuthRouters.route("/logout").post(AuthController.LogoutUser);
  // AuthRouters.route("/uploadmedia").post(AuthController.Uploadfile)

  AuthRouters.route("/profile").get(AuthController.getprofile)
  AuthRouters.route("/changePassword").post(AuthController.changePassword);


  AuthRouters.route("/notificationUpdate").post(AuthController.notificationUpdate)

  AuthRouters.route("/profile").put(AuthController.updateProfile);
  AuthRouters.route("/subacc/balance/:id").get(AuthController.subAccBalance);

});
