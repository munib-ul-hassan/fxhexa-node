import { Schema, model } from "mongoose";

const privacypolicyschema = new Schema({
  privacypolicy: {
    type: String,
  },
});

const PrivacyPolicy = model("PrivacyPolicy", privacypolicyschema);
export default PrivacyPolicy;
