import { Schema, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // previousBalance: {
    //   type: Number,
    //   required: true,
    // },
    // newBalance: {
    //   type: Number,
    //   required: true,
    // },
    transactionAmount: {
      type: Number,
      required: true,
    },
    // from: {
    //   type: String,
    //   required: true,
    // },
    coin: {
      type: String,
      required: true,
    },
    accountTag: {
      type: String,
      enum: ["demo", "real"],
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
  },
  {
    timestamps: true,
    expires: 3600,
  }
);

const TransactionModel = model("transaction", TransactionSchema);

export default TransactionModel;
