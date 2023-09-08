import { Schema, model } from "mongoose";

const Requestschema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      accountType: {
        type: String,
        enum: ["real", "demo"],
        required:true
      },
      accountref: {
        type: Schema.Types.ObjectId,
        refPath: "accountType"
      },
    status: {
        type: String,
        enum: ["pending", "accepted", "cancelled"],
        default: "pending"
    },
    comment: {
        type: String
    },
    stock: {
        type: String
    },
    transactionID: {
        type: String
    },
    requestType: {
        type: String,
        enum: ["Buy", "Sell", "Deposit"]
    },
    paymentType: {
        type: String,
        enum: ["perfect","bank","bitcoin"]
    },
    exchangeAmount: { type: Number },
    amount: {
        type: Number
    },

    image: {
        type: String
    },
}, {
    timestamps: true
});

const RequestModel = model("Request", Requestschema);
export default RequestModel;
