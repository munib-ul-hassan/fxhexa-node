

import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";



import NotificationModel from "../DB/Model/notificationModel.js";
import AuthModel from "../DB/Model/authModel.js";
import UserModel from "../DB/Model/userModel.js";
import mongoose from "mongoose";
import subAccountModel from "../DB/Model/subAccountModel.js";

const getNotification = async (req, res, next) => {
  try {
    const data = await NotificationModel.find({ user: req.user._doc.profile });
    return next(CustomSuccess.createSuccess(data, "Notification get Successfully", 201));
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
const deleteaccount = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction()
  try {
    const { user } = req

    await AuthModel.findOneAndUpdate({ user: user._doc.profile }, { isDeleted: true });
    // await UserModel.find({ _id: user._doc.profile });

    session.commitTransaction()
    return next(CustomSuccess.createSuccess({}, "User Account deleted Successfully", 201));
  } catch (error) {
    session.abortTransaction()

    return next(CustomError.badRequest(error.message));
  }
}
const getMyProfile = async (req, res,next) => {
  try {
    const { id } = req.params
    const data = await subAccountModel.findOne({
      auth: req.user._id,
      _id: id
    })  
    if (!data) {
      return next(CustomError.createError("Invalid id", 200));
    } else {
      return next(CustomSuccess.createSuccess(data, "User Account information get Successfully", 201));
    }
  } catch (error) {


    return next(CustomError.badRequest(error.message));
  }
}
const UserController = {

  getNotification,
  deleteaccount,
  getMyProfile

};
export default UserController;
