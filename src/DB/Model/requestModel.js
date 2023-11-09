import { Schema, model } from "mongoose";

const Requestschema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    accountref: {
        type: Schema.Types.ObjectId,
        ref: "subAcc"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "cancelled"],
        default: "pending"
    },
    comment: {
        type: String
    },

    transactionID: {
        type: String
    },

    paymentType: {
        type: String,
        enum: ["perfect", "bank", "bitcoin"]
    },
    requestType: {
        type: String,
        enum: ["deposit", "withdraw"]
    },
    paymentCode: { type: String },
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
