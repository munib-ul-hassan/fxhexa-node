import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, trim: true, required: true },
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    currency: {
      type: String
    },
    image: {
      type: String
    },

  },
  {
    timestamps: true,
  },
);

const UserModel = model("User", UserSchema);

export default UserModel;
