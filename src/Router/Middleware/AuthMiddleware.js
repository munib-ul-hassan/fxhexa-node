import AuthModel from "../../DB/Model/authModel.js";
import { joseJwtDecrypt, verifyJWT } from "../../Utils/jwt.js";
import CustomError from "../../Utils/ResponseHandler/CustomError.js";
import { AuthMiddlewareValidator } from "../../Utils/Validator/commonValidation.js";

export const AuthMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  const { error } = AuthMiddlewareValidator.validate({
    authToken: authorization,
  });

  if (error) {
    return next(CustomError.unauthorized(error.message));
  }
  const UserToken = await joseJwtDecrypt(authorization);

  const UserDetail = await AuthModel.findOne({ _id: UserToken.payload?.uid }).populate([
    "profile",
    "devices",
  ]);

  if (!UserDetail) {
    return next(CustomError.unauthorized());
  }

  // req.user ={...UserDetail,tokenType:UserToken.payload.tokenType};
  req.user = UserDetail;
  req.user.tokenType = UserToken.payload.tokenType;

  return next();
};

export const AdminMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  const { error } = AuthMiddlewareValidator.validate({
    authToken: authorization,
  });

  if (error) {
    return next(CustomError.unauthorized(error.message));
  }
  const UserToken = await joseJwtDecrypt(authorization);

  const UserDetail = await AuthModel.findOne({ _id: UserToken.payload?.uid }).populate([
    "profile",
    "devices",
  ]);

  if (!UserDetail) {
    return next(CustomError.unauthorized());
  }
  if (UserDetail.userType != "Admin") {
    return next(CustomError.createError("Only Admin can access this api", 201));
  }

  req.user = UserDetail;
  return next();
};

//chat middleware

// export const ChatMiddleware = async (req, res, next) => {
//   const { authorization } = req.headers;
//   const refreshToken = req.headers.refreshtoken;
//   const deviceToken = req.headers.devicetoken;
//   const { error } = ChatMiddlewareValidator.validate({
//     authToken: authorization,
//     refreshToken,
//   });
//   if (error) {
//     return next(CustomError.unauthorized(error.message));
//   }
//   const verify = await verifyJWT({
//     authToken: authorization,
//     refreshToken,
//     type: "Driver",
//     deviceToken,
//   });
//   if (verify.error) {

//     return next(CustomError.unauthorized(verify.error));
//   }
//   req.body.user = verify;

//   return next();
// };
