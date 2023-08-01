import joi from "joi";

export const AuthMiddlewareValidator = joi.object({
  authToken: joi.string().required() 
});
export const deviceRequired = {
  //test the given deviceToken
  deviceToken: joi.string().required(),
  deviceType: joi.string().required().equal("android", "ios", "postman"),
};
