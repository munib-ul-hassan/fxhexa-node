import { Schema, model } from "mongoose";

const AdminSchema = new Schema(
  {
    fullName: { type: String, trim: true, required: true },
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    balance: { type: Number, default: 0 },

    image: {
      type: Schema.Types.String,
      // required:true
      default: "https://gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
    },

  },
  {
    timestamps: true,
  },
);

const AdminModel = model("Admin", AdminSchema);

export default AdminModel;
