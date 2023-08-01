import { Schema, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    previousBalance: {
      type: Number,
      required: true,
    },
    newBalance: {
      type: Number,
      required: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
    },
    accountTag: {
      type: String,
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
