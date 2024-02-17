import { Schema, model } from "mongoose";

const paymentsschema = new Schema({
  paymentType: {
    type: String,
    // enum: ["perfect", "bank", "bitcoin"]
  },
  title: String,
  Accno: String,
  iban: String

}, {
  timestamps: true
});

const Payments = model("payments", paymentsschema);
export default Payments;
