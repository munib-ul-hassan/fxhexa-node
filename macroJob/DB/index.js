import mongoose from "mongoose";
import dbConfig from "../Config/dbConfig.js";

export const connectDB = async () => {
  try {
    mongoose.set({
      strictQuery: true,
    });
    const conn = await mongoose.connect(dbConfig.db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected...");
    return conn;
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
