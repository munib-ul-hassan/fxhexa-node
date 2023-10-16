
import { Schema, model } from "mongoose";

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    accountref: {
      type: Schema.Types.ObjectId,
      ref: "subAcc"
    },
    unit: {
      type: Number
    },
    openAmount: {
      type: Number
    },
    closeAmount: {
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
    status: {
      type: String,
      enum: ["open", "close"],
      default: "open"
    },
    stopLoss: { type: Number },
    profitLimit: { type: Number },
    
    from: { type: String },
    to: { type: String },


    orderType: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Stock", "Forex"],
      default: "Stock"
    },
  },
  {
    timestamps: true,
    expires: 3600,
  }
);

const OrderModel = model("Order", OrderSchema);

export default OrderModel;
