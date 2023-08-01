import mongoose, { Schema, model } from "mongoose";

const fileUploadSchema = new Schema(
  {
    file: {
      type: String,
      required: true,
    },
    fileType: { type: String, enum: ["Image", "Video"], default: "Image" },
    fileRole: {
      type: String,
      enum: ["image", "post", "certificate", "story"],
      default: "image"
    },
    userType: {
      type: String,
      enum: ["Instructor", "Customer"],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      refPath: "userType",
      require: true,
    },
  },
  {
    timestamps: true,
  },
);

const fileUploadModel = model("Fileupload", fileUploadSchema);

export default fileUploadModel;
