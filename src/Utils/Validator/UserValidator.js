import joi from "joi";
import { deviceRequired } from "./commonValidation.js";

export const RegisterValidator = joi.object({
  fullName: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  // accType: joi.string(),
  referBy: joi.string(),
  phone: joi.string(),


  ...deviceRequired,
});

//social register validator
export const SocialRegisterValidator = joi.object({
  socialType: joi.string().required().equal("apple", "facebook", "google"),
  accessToken: joi.string().required(),
  deviceToken: joi.string().required(),
  deviceType: joi.string().required().equal("android", "ios", "postman"),
  userType: joi.string().required(),
});

//login validator
export const AdminloginValidator = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});
export const LoginValidator = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),

  //test the given deviceToken
  deviceToken: joi.string().required(),
  deviceType: joi.string().required().equal("android", "ios", "postman"),
});
export const verifyOTPValidator = joi.object({
  otp: joi.string().required(),
  ...deviceRequired,
});
export const verifyuserValidator = joi.object({
  email: joi.string().email().required(),
  otp: joi.string().required(),
  ...deviceRequired,
});
//social login validator
export const SocailLoginValidator = joi.object({
  accessToken: joi.string().required(),
  socialType: joi.string().required().equal("apple", "facebook", "google"),
  deviceToken: joi.string().required(),
  deviceType: joi.string().required().equal("android", "ios", "postman"),
});

//forget password validator

export const ForgotPasswordValidator = joi.object({
  email: joi.string().required(),
});

// otp validator
export const ResetPasswordOTPValidator = joi.object({
  user_id: joi.string().required(),
  otp: joi.string().required(),
});

//reset password validator
export const ResetPasswordValidator = joi.object({
  password: joi.string().required(),
  deviceToken: joi.string(),
});
export const changePasswordValidator = joi.object({
  oldPassword: joi.string().required(),
  newPassword: joi.string().required(),
});

//profile validator

export const ProfileValidator = joi.object({
  fullName: joi.string(),
  accType: joi.string(),
phone: joi.string(),


});

//logout validator
export const LogoutValidator = joi.object({
  user: joi.object(),
});


export const subAccValidator = joi.object({
  type: joi.string().equal("demo", "real").required(),
  name: joi.string().required(),
  password: joi.string().required(),
  leverage: joi.string().required(),
  currency: joi.string().required(),

})

export const subAccupdateValidator = joi.object({

  name: joi.string(),
  password: joi.string(),
  leverage: joi.string(),
  currency: joi.string(),

})


export const loginsubAccValidator = joi.object({

  name: joi.string().required(),
  password: joi.string().required(),


})