import bcrypt from "bcrypt";
import { genSalt } from "../Utils/saltGen.js";
import DeviceModel from "../DB/Model/deviceModel.js";

import { tokenGen } from "../Utils/AccessTokenManagement/Tokens.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { sendEmails } from "../Utils/SendEmail.js";
import {
  LoginValidator,
  ResetPasswordValidator,
  RegisterValidator,
  ForgotPasswordValidator,
  verifyOTPValidator,
  changePasswordValidator,
  LogoutValidator,
  verifyuserValidator,
  ProfileValidator,
} from "../Utils/Validator/UserValidator.js";
import OtpModel from "../DB/Model/otpModel.js";
import UserModel from "../DB/Model/userModel.js";
import { linkUserDevice } from "../Utils/linkUserDevice.js";
import { randomInt } from "crypto";

// import { handleMultipartData } from "../Utils/MultipartData.js";
import AuthModel from "../DB/Model/authModel.js";
import coinModel from "../DB/Model/coinsModel.js";

// import AdminModel from "../DB/Model/adminModel.js";

const registerUser = async (req, res, next) => {
  try {
    const { error } = RegisterValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { fullName, email, password, deviceType, deviceToken, accType } =
      req.body;

    const IsUser = await AuthModel.findOne({ identifier: email });
    if (IsUser) {
      return next(CustomError.createError("User Already Exists", 400));
    }

    const auth = await new AuthModel({
      identifier: email,
      password,
      accType,
    }).save();

    if (!auth) {
      return next(CustomError.createError("error registering user", 200));
    }

    const otp = randomInt(100000, 999999);
    const OTP = await new OtpModel({
      auth: auth._id,
      otpKey: otp,
      reason: "register",
      expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    }).save();

    const emailData = {
      subject: "fx-hexa - Account Verification",
      html: `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;"
              src="cid:background" alt="background"
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
            <img
              style="width: 300px;"
              src="cid:logo" alt="logo" />
          </div>
        </header>
        <main
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1
            style="color: #fd6835; font-size: 30px; font-weight: 700;"
          >Welcome To fx-hexa</h1>
          <p
            style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
          >Hi ${fullName},</p>
          <p
            style="font-size: 20px; text-align: left; font-weight: 500;"
          >Thank you for registering with us. Please use the following OTP to verify your email address.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #fd6835; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${otp}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `,
    };

    const usermodel = await new UserModel({
      auth: auth._id,
      fullName,
    }).save();
    // if(userType == "Admin"){
    //   UserModel = await new AdminModel({
    //     auth: auth._id,
    //     fullName,
    //
    //   }).save();
    // }
    if (!usermodel) {
      return next(CustomError.createError("error creating user profile", 200));
    } else {
      const profile = usermodel._id;

      const democoin = await coinModel.findOne({ coin: "BTCUSDT" })
      const updatedAuth = await AuthModel.findByIdAndUpdate(
        { _id: auth._id },
        {
          profile,
          OTP: OTP._id,
          demo: [{
            coin: democoin?._id, ammount: 1000
          }],
          real: []
        },
        {
          new: true,
        }
      );
      if (!updatedAuth) {
        return next(
          CustomError.createError("error creating user profile", 200)
        );
      }

      const { error } = await linkUserDevice(
        updatedAuth._id,
        deviceToken,
        deviceType
      );
      if (error) {
        return next(CustomError.createError(error, 200));
      }
      const user = await AuthModel.findById(auth._id).populate(["profile", "demo.coin", "real.coin"]);

      const respdata = {
        _id: user.profile._doc._id,
        email: user.identifier,
        fullName: user.profile._doc.fullName,
        userType: "User",
        // image: { file: "" },
        otp,
        demo: user.demo? user.demo.map((item) => {
          return { coin: item.coin.coin, ammount: item.ammount }
        }):[],
        real: user.real ? user.real.map((item) => {
          return { coin: item.coin.coin, ammount: item.ammount }
        }) : [],


        isCompleteProfile: user.isCompleteProfile,
        notificationOn: user.notificationOn,
      };
      const token = await tokenGen(user, "auth", deviceToken);

      sendEmails(email, emailData.subject, emailData.html);

      return next(
        CustomSuccess.createSuccess(
          { ...respdata, token },
          "User register succesfully",
          200
        )
      );
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const auth = await AuthModel.findOne({
      identifier: email,
    }).populate("profile");

    if (!auth) {
      return next(CustomError.createError("Invalid user", 200));
    }

    const otp = randomInt(100000, 999999);
    await OtpModel.findOneAndUpdate(
      { auth: auth._id },
      {
        otpKey: await bcrypt.hash(otp.toString(), genSalt),
        reason: "register",
        expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      }
    );

    const emailData = {
      subject: "fx-hexa - Account Verification",
      html: `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;"
              src="cid:background" alt="background"
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
            <img
              style="width: 300px;"
              src="cid:logo" alt="logo" />
          </div>
        </header>
        <main
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1
            style="color: #fd6835; font-size: 30px; font-weight: 700;"
          >Welcome To fx-hexa</h1>
          <p
            style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
          >Hi ${auth.profile._doc.fullName},</p>
          <p
            style="font-size: 20px; text-align: left; font-weight: 500;"
          >Thank you for registering with us. Please use the following OTP to verify your email address.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #fd6835; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${otp}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `,
    };
    sendEmails(email, emailData.subject, emailData.html);

    return next(
      CustomSuccess.createSuccess(otp, "OTP resend Successfully", 200)
    );
  } catch (error) {
    console.log(error);
    next(CustomError.createError(error.message, 500));
  }
};
const LoginUser = async (req, res, next) => {
  try {
    const { error } = LoginValidator.validate(req.body);

    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }
    const { email, password, deviceToken, deviceType } = req.body;

    const user = await AuthModel.findOne({
      identifier: email,
    }).populate({
      path: "profile",
    });

    if (!user) {
      // return res.status(200).send({ success: false, message: "Email not found!" });
      return next(CustomError.createError("Email not found!", 200));
    }
    if (user.isDeleted) {
      return next(
        CustomError.createError(
          "Account is deleted, Contact to team for further guidance",
          200
        )
      );
    }
    if (!user.isCompleteProfile) {
      return next(CustomError.createError("First Verify account", 200));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(
        CustomError.createError("You have entered wrong password", 200)
      );
    }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }

    const token = await tokenGen(user, "auth", deviceToken);

    const profile = user._doc.profile._doc;

    const respdata = {
      _id: profile._id,
      fullName: profile.fullName,
      email: user.identifier,
      userType: user.userType,
      // image:  profile.image,
      demo: user._doc.demo ?  user._doc.demo.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[],
      real: user._doc.real?  user._doc.real.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[],
      isCompleteProfile: user._doc.isCompleteProfile,
      notificationOn: user._doc.notificationOn,
    };
    return next(
      CustomSuccess.createSuccess(
        { ...respdata, token },
        "User login succesfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    return next(CustomError.createError(error.message, 500));
  }
};
const ForgetPassword = async (req, res, next) => {
  try {
    // VAlidate the request body
    const { error } = ForgotPasswordValidator.validate(req.body);
    if (error) {
      next(CustomError.createError(error.message, 200));
    }
    const identifier = req.body.email;
    // var UserDetail;
    const isUser = await AuthModel.findOne({ identifier }).populate("profile");
    if (!isUser) {
      next(CustomError.createError("Invalid Email", 200));
    }
    const name = isUser.profile.fullName;

    // Generate 6 Digit OTP
    const OTP = randomInt(100000, 999999);

    // const OTP = uid(6).toUpperCase();
    // const OTP=Math.floor()
    const emailData = {
      subject: "fx-hexa - Account Verification",
      html: `
      <div
        style = "padding:20px 20px 40px 20px; position: relative; overflow: hidden; width: 100%;"
      >
        <img 
              style="
              top: 0;position: absolute;z-index: 0;width: 100%;height: 100vmax;object-fit: cover;" 
              src="cid:background" alt="background" 
        />
        <div style="z-index:1; position: relative;">
        <header style="padding-bottom: 20px">
          <div class="logo" style="text-align:center;">
            <img 
              style="width: 300px;" 
              src="cid:logo" alt="logo" />
          </div>
        </header>
        <main 
          style= "padding: 20px; background-color: #f5f5f5; border-radius: 10px; width: 80%; margin: 0 auto; margin-bottom: 20px; font-family: 'Poppins', sans-serif;"
        >
          <h1 
            style="color: #a87628; font-size: 30px; font-weight: 700;"
          >Welcome To fx-hexa</h1>
          <p
            style="font-size: 24px; text-align: left; font-weight: 500; font-style: italic;"
          >Hi ${name},</p>
          <p 
            style="font-size: 20px; text-align: left; font-weight: 500;"
          > Please use the following OTP to reset your password.</p>
          <h2
            style="font-size: 36px; font-weight: 700; padding: 10px; width:100%; text-align:center;color: #a87628; text-align: center; margin-top: 20px; margin-bottom: 20px;"
          >${OTP}</h2>
          <p style = "font-size: 16px; font-style:italic; color: #343434">If you did not request this email, kindly ignore this. If this is a frequent occurence <a
          style = "color: #a87628; text-decoration: none; border-bottom: 1px solid #a87628;" href = "#"
          >let us know.</a></p>
          <p style = "font-size: 20px;">Regards,</p>
          <p style = "font-size: 20px;">Dev Team</p>
        </main>
        </div>
      <div>
      `,
    };
    const otpDb = await OtpModel.findOneAndUpdate(
      { auth: isUser._id },
      {
        otpKey: await bcrypt.hash(OTP.toString(), genSalt),
        reason: "forgotPassword",
        expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
      },
      {
        upsert: true,
        new: true,
      }
    );
    // const otpDb = await OtpModel.create({
    //   auth: isUser._id,
    //   otpKey: OTP,
    //   reason: "forgotPassword",
    //   expireAt: new Date(new Date().getTime() + 60 * 60 * 1000),
    // });
    // otpDb.save();
    isUser.OTP = otpDb._id;
    await isUser.save();

    sendEmails(req.body.email, emailData.subject, emailData.html);
    const { deviceToken } = req.headers;

    const token = await tokenGen(isUser, "forgot password", deviceToken, true);

    // Send Response
    const data = { OTP, token };
    return next(
      CustomSuccess.createSuccess(
        data,
        "Email has been sent to the registered account",
        200
      )
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("code not send", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

const VerifyUser = async (req, res, next) => {
  try {
    const { error } = verifyuserValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }

    const { email, otp, deviceToken, deviceType } = req.body;

    const user = await AuthModel.findOne({
      identifier: email,
    }).populate(["profile", "OTP"]);
    if (!user) {
      return next(CustomError.createError("User not found", 200));
    }
    const OTP = user.OTP;
    if (!OTP) {
      return next(CustomError.createError("OTP not found", 200));
    }

    const userOTP = await bcrypt.hash(otp, genSalt);
    if (OTP.otpKey !== userOTP) {
      return next(CustomError.createError("Invalid OTP", 200));
    }

    const currentTime = new Date();
    const OTPTime = OTP.expireAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return next(CustomError.createError("OTP expired", 200));
    }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    await AuthModel.findOneAndUpdate(
      { identifier: email },
      { isCompleteProfile: true }
    );

    const token = await tokenGen(user, "verify otp", deviceToken);

    const bulkOps = [];
    const update = { otpUsed: true };
    // let  userUpdate ;
    // if (OTP._doc.reason !== "register") {
    //   bulkOps.push({
    //     deleteOne: {
    //       filter: { _id: OTP._id },
    //     },
    //   });
    //   // userUpdate.OTP = null;
    // }
    bulkOps.push({
      updateOne: {
        filter: { _id: OTP._id },
        update: { $set: update },
      },
    });
    OtpModel.bulkWrite(bulkOps);
    // AuthModel.updateOne({ identifier: user.identifier }, { $set: userUpdate });
    user.profile._doc.userType = user.userType;
    user.profile._doc.email = user.identifier;
    user.profile._doc.demo = user.demo?  user.demo.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[],
    user.profile._doc.real = user.real ?   user.real.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[]
    const profile = { ...user.profile._doc, token };
    delete profile.auth;

    return next(
      CustomSuccess.createSuccess(profile, "User verified successfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("otp not verify", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

const VerifyOtp = async (req, res, next) => {
  try {
    if (req.user.tokenType != "forgot password") {
      return next(
        CustomError.createError("Token type is not forgot password", 200)
      );
    }

    const { error } = verifyOTPValidator.validate(req.body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }

    const { otp, deviceToken, deviceType } = req.body;
    const { identifier } = req.user;

    const user = await AuthModel.findOne({ identifier }).populate([
      "profile",
      "OTP",
      "demo.coin",
      "real.coin"
    ]);
    if (!user) {
      return next(CustomError.createError("User not found", 200));
    }
    const OTP = user.OTP;
    if (!OTP) {
      return next(CustomError.createError("OTP not found", 200));
    }

    const userOTP = await bcrypt.hash(otp, genSalt);
    if (OTP.otpKey !== userOTP) {
      return next(CustomError.createError("Invalid OTP", 200));
    }

    const currentTime = new Date();
    const OTPTime = OTP.expireAt;
    const diff = currentTime.getTime() - OTPTime.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes > 60) {
      return next(CustomError.createError("OTP expired", 200));
    }
    const device = await linkUserDevice(user._id, deviceToken, deviceType);
    if (device.error) {
      return next(CustomError.createError(device.error, 200));
    }
    const token = await tokenGen(user, "verify otp", deviceToken);

    const bulkOps = [];
    const update = { otpUsed: true };
    // let  userUpdate ;
    if (OTP._doc.reason !== "forgotPassword") {
      bulkOps.push({
        deleteOne: {
          filter: { _id: OTP._id },
        },
      });
      // userUpdate.OTP = null;
    }
    bulkOps.push({
      updateOne: {
        filter: { _id: OTP._id },
        update: { $set: update },
      },
    });
    OtpModel.bulkWrite(bulkOps);
    // AuthModel.updateOne({ identifier: user.identifier }, { $set: userUpdate });
    user.profile._doc.userType = user.userType;
    user.profile._doc.email = user.identifier;
    user.profile._doc.demo = user.demo?  user.demo.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[];
    user.profile._doc.real = user.real ?  user.real.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[];
    const profile = { ...user.profile._doc, token };
    delete profile.auth;

    return next(
      CustomSuccess.createSuccess(profile, "OTP verified successfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("otp not verify", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};
const ResetPassword = async (req, res, next) => {
  try {
    if (req.user.tokenType != "verify otp") {
      return next(
        CustomError.createError("First verify otp then reset password", 200)
      );
    }
    const { error } = ResetPasswordValidator.validate(req.body);

    if (error) {
      error.details.map((err) => {
        next(err.message, 200);
      });
    }

    // const { devicetoken } = req.headers;

    const { identifier } = req.user;
    // if (req.user.devices[req.user.devices.length - 1].deviceToken != devicetoken) {
    //   return next(CustomError.createError("Invalid device access", 200));
    // }

    const updateuser = await AuthModel.findOneAndUpdate(
      { identifier },
      {
        password: await bcrypt.hash(req.body.password, genSalt),
        OTP: null,
      },
      { new: true }
    );

    // if (!updateuser) {
    //   return next(CustomError.createError("password not reset", 200));
    // }

    const user = await AuthModel.findOne({ identifier }).populate("profile");
    const token = await tokenGen(user, "auth", req.body.deviceToken);
    user.profile._doc.userType = user.userType;
    user.profile._doc.email = user.identifier;
    user.profile._doc.demo = user.demo?  user.demo.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[];
    user.profile._doc.real = user.real ?  user.real.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[]
    const profile = { ...user.profile._doc, token };
    delete profile.auth;

    return next(
      CustomSuccess.createSuccess(profile, "password reset succesfully", 200)
    );
  } catch (error) {
    if (error.code === 11000) {
      return next(CustomError.createError("code not send", 200));
    }
    return next(CustomError.createError(error.message, 200));
  }
};

// const UpdateProfile = async (req, res, next) => {
//   try {
//     const { user } = req;
//     const { files } = req;

//     let body = Object.fromEntries(
//       Object.entries(req.body).filter(([_, v]) => v != null || v != ""),
//     );

//     const { error } = profileValidator.validate(body);
//     if (error) {
//       error.details.map((err) => {
//         next(CustomError.createError(err.message, 200));
//       });
//     }
//     if (files?.image && files?.image[0]) {
//       const FileUploadModel = new fileUploadModel({
//         file: files.image[0].filename,
//         fileRole: "image",
//         fileType: "Image",
//         userType: user.userType,
//         user: user.profile._doc._id,
//       });
//       FileUploadModel.save();
//       body.image = FileUploadModel._id;
//     }

//     await UserModel.findByIdAndUpdate(user.profile._id.toString(), body, {
//       new: true,
//     });
//     await AuthModel.findByIdAndUpdate(user._id, { isCompleteProfile: true });

//     const data = await AuthModel.findById(user._id).populate({
//       path: "profile",
//       populate: [
//         "image"

//       ],
//     });
//     const token = await tokenGen(data, "auth", req.body.deviceToken);

//     data.token = token;
//     return next(CustomSuccess.createSuccess(data, "profile update sucessfully", 200));
//   } catch (error) {
//     return next(CustomError.createError(error.message, 500));
//   }
// };
const LogoutUser = async (req, res, next) => {
  const { error } = LogoutValidator.validate({ user: req.user });

  if (error) {
    error.details.map((err) => {
      return next(CustomError.createError(err.message, 200));
    });
  }
  const { devicetoken } = req.headers;
  const { auth } = req.user.profile;
  const deviceId = await DeviceModel.findOne({
    auth,
    deviceToken: devicetoken,
  });
  await AuthModel.findByIdAndUpdate(auth, {
    $push: {
      loggedOutDevices: deviceId._id,
    },
    $pull: { devices: deviceId._id },
  });

  const logoutuser = await DeviceModel.findOneAndUpdate(
    {
      auth,
      deviceToken: devicetoken,
    },
    {
      $set: {
        status: "loggedOut",
      },
    }
  );
  if (!logoutuser) {
    return next(CustomError.createError("device not found", 200));
  }
  return next(CustomSuccess.createSuccess({}, "user logout succesfully", 200));
};
const getprofile = async (req, res, next) => {
  try {
    const { user } = req;

    const data = await AuthModel.findById(user._id).populate({
      path: "profile",
    });
    const token = await tokenGen(data, "auth", req.body.deviceToken);

    const respdata = {
      _id: data.profile._id,
      fullName: data.profile.fullName,
      email: data.identifier,

      // image: { file: data.profile.image?.file },
      isCompleteProfile: data.isCompleteProfile,
      token: token,
      demo: data.demo?  data.demo.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[],
      real: data.real ?  data.demo.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[],
      notificationOn: data.notificationOn,
    };

    if (!data) {
      return next(CustomError.createError("Invalid user id", 200));
    }

    return next(
      CustomSuccess.createSuccess(respdata, "profile get sucessfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { error } = changePasswordValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { newPassword } = req.body;
    const authModel = await AuthModel.findById(req.user._id);
    if (!authModel) {
      return next(CustomError.badRequest("User Not Found"));
    }
    if (authModel) {
      const oldPassword = await bcrypt.compare(
        req.body.oldPassword,
        authModel.password
      );
      if (authModel && oldPassword == true) {
        await AuthModel.findOneAndUpdate(
          { _id: authModel._id },
          {
            password: await bcrypt.hash(newPassword, genSalt),
          },
          { new: true }
        );
        return next(
          CustomSuccess.createSuccess({}, "Password Changed Successfully", 200)
        );
      } else {
        return next(CustomError.badRequest("Old password is incorrect"));
      }
    }
  } catch (error) {

    return next(CustomError.badRequest(error.message));
  }
};

const notificationUpdate = async (req, res, next) => {
  try {
    const user = await AuthModel.findById(req.user._id).populate([
      {
        path: "profile"
        // populate: {
        //   select: { file: 1 },
        //   path: "image",
        // },
      },
    ]);

    await AuthModel.findByIdAndUpdate(req.user._id, {
      notificationOn: !user.notificationOn,
    });
    const profile = user._doc.profile._doc,
      demo = user.demo?  user.demo.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[],
      real = user.real ?  user.real.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[];

    const respdata = {
      _id: profile._id,
      fullName: profile.fullName,
      email: user._doc.identifier,

      // image: { file: profile.image?.file },
      demo, real,
      isCompleteProfile: user._doc.isCompleteProfile,
      notificationOn: user._doc.notificationOn,
    };

    if (!user) {
      return next(CustomError.createError("Invalid user id", 200));
    } else {
      return next(
        CustomSuccess.createSuccess(respdata, "User get sucessfully", 200)
      );
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
const updateProfile = async (req, res, next) => {
  try {
    let body = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v != null || v != "")
    );

    const { error } = ProfileValidator.validate(body);
    if (error) {
      error.details.map((err) => {
        next(CustomError.createError(err.message, 200));
      });
    }
    if (body.fullName) {
      await UserModel.findByIdAndUpdate(
        req.user.profile._id.toString(),
        { fullName: body.fullName },
        {
          new: true,
        }
      );
    }
    if (body.accType) {
      await AuthModel.findByIdAndUpdate(req.user._id, {
        accType: body.accType,
      });
    }

    const user = await AuthModel.findById(req.user._id).populate([
      "profile",
      "devices",
    ]);
    console.log(user.devices);
    const token = await tokenGen(
      user,
      "auth",
      user.devices[user.devices.length - 1]?.deviceToken
    );
    const demo = user.demo?  user.demo.map((item) => {
      return { coin: item.coin.coin, ammount: item.ammount }
    }):[],
      real = user.real ?  user.real.map((item) => {
        return { coin: item.coin.coin, ammount: item.ammount }
      }):[]
    const respdata = {
      _id: user.profile._doc._id,
      email: user.identifier,
      fullName: user.profile._doc.fullName,
      userType: "User",
      demo, real,
      isCompleteProfile: user.isCompleteProfile,
      notificationOn: user.notificationOn,
    };

    return next(
      CustomSuccess.createSuccess(
        { ...respdata, token },
        "profile update sucessfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
const AuthController = {
  registerUser,
  resendOTP,
  LoginUser,

  // UpdateProfile: [
  //   handleMultipartData.fields([
  //     {
  //       name: "image",
  //       maxCount: 1,
  //     },
  //     {
  //       name: "certificate",
  //       maxCount: 5,
  //     },
  //   ]),

  //   UpdateProfile,
  // ],
  ForgetPassword,
  ResetPassword,
  LogoutUser,
  VerifyOtp,
  // Uploadfile: [handleMultipartData.array("file"), Uploadfile],
  getprofile,
  changePassword,
  notificationUpdate,
  VerifyUser,
  updateProfile,
};

export default AuthController;
