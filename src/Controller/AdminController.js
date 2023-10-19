

import bcrypt from "bcrypt";
import { genSalt } from "../Utils/saltGen.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import {
  AdminloginValidator,
} from "../Utils/Validator/UserValidator.js";

import AuthModel from "../DB/Model/authModel.js";
import PrivacyPolicy from "../DB/Model/privacypolicy.js";
import TermsConditions from "../DB/Model/termscondition.js";
import { tokenGen } from "../Utils/jwt.js";
// import push_notifications from "../Config/push_notification.js";
import { connectDB } from "../DB/index.js";

import AdminModel from "../DB/Model/adminModel.js";
import OrderModel from "../DB/Model/orderModel.js";
const registerAdmin = async () => {

  const auth = await new AuthModel({
    identifier: "admin@admin.com",
    password: "123123",
    userType: "Admin",
  }).save();



  const admindata = await new AdminModel({
    auth: auth._id,
    fullName: "admin",
  }).save();
}

// registerAdmin()


const Adminlogin = async (req, res, next) => {
  try {
    const { error } = AdminloginValidator.validate(req.body);

    if (error) {
      error.details.map((err) => {

        next(CustomError.createError(err.message, 200));
      });
    }
    const { email, password } = req.body;

    const user = await AuthModel.findOne({
      identifier: email
    }).populate({
      path: "profile",
    });
    if (!user) {
      // return res.status(200).send({ success: false, message: "Email not found!" });
      return next(CustomError.createError("Email not found!", 200));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(CustomError.createError("You have entered wrong password", 200));
    }
    // const device = await linkUserDevice(user._id, deviceToken, deviceType);
    // if (device.error) {
    //   return next(CustomError.createError(device.error, 200));
    // }

    const token = await tokenGen(user, "auth");

    const profile = user._doc.profile._doc;

    const respdata = {
      _id: profile._id,
      fullName: profile.fullName,
      userType: user.userType,
    };
    return next(CustomSuccess.createSuccess({ ...respdata, token }, "User login succesfully", 200));
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
// const sendNotification = async (req, res, next) => {
//   try {
//     const { userIds, toAllUser, title, body } = req.body;
//     var data;
//     if (toAllUser) {
//       data = await AuthModel.find({}).populate({
//         path: "devices",
//       });
//     } else {
//       data = await AuthModel.find({ profile: { $in: userIds } }, { devices: 1 }).populate({
//         path: "devices",
//       });
//     }

//     data?.devices?.map(async (val) => {
//       await push_notifications({ deviceToken: val.deviceToken, title, body });
//     });

//     return next(CustomSuccess.createSuccess({}, "Notification Sent successfully", 200));
//   } catch (error) {
//     return next(CustomError.badRequest(error.message));
//   }
//  };

const getUsers = async (req, res, next) => {
  try {

    const { page, limit } = req.query
    delete req.query.page
    delete req.query.limit

    let user = await AuthModel.find({ userType: { $ne: "Admin" } }, { password: 0, devices: 0, loggedOutDevices: 0, OTP: 0 }).populate(
      ["profile", "referBy", "referer"]
    ).limit(limit).skip((page - 1) * limit);
    let count = await AuthModel.count({ userType: { $ne: "Admin" } })

    if (user.length > 0) {
      return next(CustomSuccess.createSuccess({ count, user }, "You have get Users successfully", 200));
    } else {
      return next(CustomError.notFound("No User found"));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.query
    let user = await AuthModel.findOne({
      userType: { $ne: "Admin" }, $or: [
        {
          _id: id
        }, {
          profile: id
        }
      ]
    }, { password: 0, devices: 0, loggedOutDevices: 0, OTP: 0 }).populate(
      ["profile", "referBy", "referer", "subAccounts"]

    );

    if (user) {
      return next(CustomSuccess.createSuccess(user, "You have get User successfully", 200));
    } else {
      return next(CustomError.notFound("Invalid User Id"));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

///privacy

const createPrivacy = async (req, res, next) => {
  try {
    const { privacypolicy } = req.body;
    if (!privacypolicy) {
      return next(CustomError.badRequest("privacypolicy is required"));
    }
    const data = await PrivacyPolicy.find({});
    if (data.length > 0) {
      return next(CustomError.badRequest("Only one privacypolicy can be created "));
    }
    const createprivacy = new PrivacyPolicy({
      privacypolicy: req.body.privacypolicy,
    });

    const saveprivacy = await createprivacy.save();

    if (!saveprivacy) {
      return next(CustomError.badRequest("privacy not save"));
    }

    return next(CustomSuccess.createSuccess(saveprivacy, "Privacy is created successfully", 200));
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

//get privacy
const getPrivacy = async (req, res, next) => {
  try {
    const getprivacy = await PrivacyPolicy.find();

    if (!getprivacy || getprivacy.length == 0) {
      return next(CustomError.badRequest("privacy not found"));
    } else {
      return next(CustomSuccess.createSuccess(getprivacy[0], "privacy found successfully", 200));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
const deletePrivacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("id is required"));
    }
    const getprivacy = await PrivacyPolicy.findById(id);
    if (!getprivacy) {
      return next(CustomError.badRequest("Invalid Id"));
    } else {
      await PrivacyPolicy.deleteOne(
        { _id: id },

        { new: true },
      );
      return next(CustomSuccess.createSuccess({}, "privacy delete successfully", 200));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
const updatePrivacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("id is required"));
    }
    const getprivacy = await PrivacyPolicy.findById(id);
    if (!getprivacy) {
      return next(CustomError.badRequest("Invalid Id"));
    } else {
      const updateprivacy = await PrivacyPolicy.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      return next(
        CustomSuccess.createSuccess({ updateprivacy }, "privacy updated successfully", 200),
      );
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
///privacy

///terms

//create
const createTerms = async (req, res, next) => {
  try {
    const { termscondition } = req.body;
    if (!termscondition) {
      return next(CustomError.badRequest("termscondition is required"));
    }
    const data = await TermsConditions.find({});
    if (data.length > 0) {
      return next(CustomError.badRequest("Only one terms can be created "));
    }

    const createterms = new TermsConditions({
      termscondition: req.body.termscondition,
    });

    const saveterms = await createterms.save();

    if (!saveterms) {
      return next(CustomError.badRequest("Terms not save"));
    }

    return next(CustomSuccess.createSuccess(saveterms, "Terms is created successfully", 200));
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

//get terms

const getTerms = async (req, res, next) => {
  try {
    const getterms = await TermsConditions.find();

    if (!getterms || getterms.length == 0) {
      return next(CustomError.badRequest("Terms not found"));
    } else {
      return next(CustomSuccess.createSuccess(getterms[0], "Terms found successfully", 200));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

const deleteTerms = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("id is required"));
    }
    const getterms = await TermsConditions.findById(id);
    if (!getterms) {
      return next(CustomError.badRequest("Invalid Id"));
    } else {
      await TermsConditions.deleteOne(
        { _id: id },

        { new: true },
      );
      return next(CustomSuccess.createSuccess({}, "Terms delete successfully", 200));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
const updateTerms = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(CustomError.badRequest("id is required"));
    }
    const getterms = await TermsConditions.findById(id);
    if (!getterms) {
      return next(CustomError.badRequest("Invalid Id"));
    } else {
      const updateterms = await TermsConditions.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
      });
      return next(CustomSuccess.createSuccess({ updateterms }, "Terms updated successfully", 200));
    }
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

const deleteUser = async (req, res, next) => {
  var connection = await connectDB();
  const session = await connection.startSession();
  try {
    await session.startTransaction();
    const { id } = req.params;
    await AuthModel.findOneAndUpdate(
      { profile: id },
      {
        isDeleted: true,
      },
      { new: true },
    );

    // if (!deleteuser) {
    //   next(CustomError.createError("user not delete", 200));
    // } else {
    //   next(CustomSuccess.createSuccess({}, "user delete succesfully", 200));
    // }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    return next(CustomError.badRequest(error.message));
  } finally {
    await session.endSession();
    next(CustomSuccess.createSuccess({}, "user delete succesfully", 200));
  }
};
const getdashboard = async (req, res, next) => {
  try {
    const users = await AuthModel.find({ userType: { $ne: "Admin" } }).populate(["profile", "devices"]);


    const groupByKeys = (data, keys) => {
      let finalResult = keys.map((key) => {
        return Object.values(
          data.reduce((result, obj) => {
            let objKey = obj[key];
            result[objKey] = result[objKey] || { key: key, count: 0, value: objKey };
            result[objKey].count += 1;
            return result;
          }, {}),
        );
      });
      return finalResult;
    };
    next(
      CustomSuccess.createSuccess(
        {
          android: users.filter((item) => {
            return item.devices[item.devices.length - 1]?.deviceType == "android";
          }).length,
          ios: users.filter((item) => {
            return item.devices[item.devices.length - 1]?.deviceType == "ios";
          }).length,
          web: users.filter((item) => {
            return item.devices[item.devices.length - 1]?.deviceType == "web";
          }).length,

          social: groupByKeys(users, ["socialType"])[0],
          users: users.length,

        },

        "Dashboard data found",
        200,
      ),
    );
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
///terms


const getstocks = async (req, res, next) => {
  try {
    const { page, limit } = req.query
    delete req.query.page
    delete req.query.limit

    const data = await OrderModel.find({ type: "Stock" }, { type: 0 }).populate({ path: "user", select: ["fullName"] })
      .populate({ path: "accountref", select: ["currency", "balance"] })
      .sort({ creartedAt: -1 }).limit(limit).skip((page - 1) * limit);

    const count = await OrderModel.count({ type: "Stock" })

    next(
      CustomSuccess.createSuccess(
        { count, data },

        "Stocks data found",
        200,
      ),
    );
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};
const getforex = async (req, res, next) => {
  try {
    const { page, limit } = req.query
    delete req.query.page
    delete req.query.limit

    const data = await OrderModel.find({ type: "Forex" }, { type: 0 }).populate({ path: "user", select: ["fullName"] })
      .populate({ path: "accountref", select: ["currency", "balance"] })
      .sort({ creartedAt: -1 })
      .limit(limit).skip((page - 1) * limit);
    const count = await OrderModel.count({ type: "Forex" })




    next(
      CustomSuccess.createSuccess(


        { count, data },

        "Forex data found",
        200,
      ),
    );
  } catch (error) {
    return next(CustomError.badRequest(error.message));
  }
};

const AdminController = {
  Adminlogin,
  getUsers,
  getUserById,
  createPrivacy,
  getPrivacy,
  updatePrivacy,
  deletePrivacy,
  createTerms,
  getTerms,
  deleteTerms,
  updateTerms,

  deleteUser,
  getdashboard,
  getstocks,
  getforex


};
export default AdminController;
