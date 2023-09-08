import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { genSalt } from "../../Utils/saltGen.js";

const AuthSchema = new Schema(
  {
    identifier: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
    },
    accessToken: {
      type: String,
      trim: true,
      required: false,
    },

    userType: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
      required: true,
    },
    profile: {
      type: Schema.Types.ObjectId,
      refPath: "userType",
      required: false,
    },
    devices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
        required: false,
      },
    ],
    loggedOutDevices: [
      {
        type: Schema.Types.ObjectId,
        ref: "Device",
        required: false,
      },
    ],
    notificationOn: {
      type: Boolean,
      default: true,
      required: false,
    },
    acctype: {
      type: String,
      enum: ["demo", "real"],
      default: "demo",
    },
    OTP: {
      type: Schema.Types.ObjectId,
      ref: "Otp",
    },
    
   
   subAccounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "subaccount",
      }
    ],
    // isVerified: { not in the scope
    //   type: Boolean,
    //   default: false,
    // },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    isCompleteProfile: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

AuthSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, genSalt);
  }

  next();
});

const AuthModel = model("Auth", AuthSchema);

export default AuthModel;
