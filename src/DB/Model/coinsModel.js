import { Schema, model } from "mongoose";

const coinschema = new Schema({
  coin: {
    type: String,
  },
});

const coinModel = model("coin", coinschema);
export default coinModel;
