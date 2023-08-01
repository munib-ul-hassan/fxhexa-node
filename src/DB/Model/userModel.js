import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: { type: String, trim: true, required: true },
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },

    image: {
      type: Schema.Types.String,
      ref: "Fileupload"     
    },

  },
  {
    timestamps: true,
  },
);

const UserModel = model("User", UserSchema);

export default UserModel;
