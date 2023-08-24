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
    amount: {
        type: Number
    },
    stock: {
        type: String
    },
    requestType: {
        type: String,
        enum: ["Buy", "Sell"]
    },
    exchangeAmmount: { type: Number },
    image: {
        type: String
    },
}, {
    timestamps: true
});

const RequestModel = model("Request", Requestschema);
export default RequestModel;
