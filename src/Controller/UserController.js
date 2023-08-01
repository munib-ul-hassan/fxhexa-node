

import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import {
  dietvalidator,
  nutritionvalidator,
  routinevalidator,
} from "../Utils/Validator/UserValidator.js";


import NotificationModel from "../DB/Model/notificationModel.js";
import AuthModel from "../DB/Model/authModel.js";
import UserModel from "../DB/Model/userModel.js";
import mongoose from "mongoose";

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

    await AuthModel.findOneAndUpdate({ user: user._doc.profile },{isDeleted:true});
    // await UserModel.find({ _id: user._doc.profile });

    session.commitTransaction()
    return next(CustomSuccess.createSuccess({}, "User Account deleted Successfully", 201));
  } catch (error) {
    session.abortTransaction()

    return next(CustomError.badRequest(error.message));
  }
}
const UserController = {

  getNotification,
  deleteaccount

};
export default UserController;
