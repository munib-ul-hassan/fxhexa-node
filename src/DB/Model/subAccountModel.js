import { Schema, model } from "mongoose"

const subAccSchema = new Schema({
    auth: {
        type: Schema.Types.ObjectId,
        ref: 'Auth',
    },
    name: { type: String, unique: true },
    type: { type: String, enum: ["demo", "real"] },
    leverage: { type: String },
    currency: { type: String },
    password: { type: String },

    balance: { type: Number ,default:0},
    stockData: [{
        stock: String,
        amount: Number
    }]
}, {
    timestamps: true
})

const subAccountModel = model("subAcc", subAccSchema)
export default subAccountModel