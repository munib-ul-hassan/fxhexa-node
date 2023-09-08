
import { Schema, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    accountref: {
      type: Schema.Types.ObjectId,
      ref: "subAcc"
    },
    amount: {
      type: Number,
      required: true,
    },
    exchangeAmount: {
      type: Number
    },
    stock: {
      type: String
    },
    prevBalance: {
      type: Number
    },
    newBalance: {
      type: Number

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
