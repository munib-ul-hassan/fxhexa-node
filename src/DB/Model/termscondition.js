import { Schema, model } from "mongoose";

const termsconditionschema = new Schema({
  termscondition: {
    type: String,
  },
});

const TermsConditions = model("TermsCondition", termsconditionschema);
export default TermsConditions;
