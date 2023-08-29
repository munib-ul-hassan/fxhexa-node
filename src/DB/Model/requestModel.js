import { Schema, model } from "mongoose";

const Requestschema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    exchangeAmmount: { type: Number },
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
