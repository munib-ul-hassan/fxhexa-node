// Librarys
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import morganBody from "morgan-body";
import path from "path";
import { fileURLToPath } from "url";
// DB Connection
import { connectDB } from "./DB/index.js";
import { ResHandler } from "./Utils/ResponseHandler/ResHandler.js";

import { AuthRouters } from "./Router/AuthRouter.js";


// import { ChatRouters } from "./Router/ChatRouters.js";
import { UserRouters } from "./Router/UserRouter.js";
import { AdminRouters } from "./Router/AdminRouters.js";
import { getForexData } from "./Config/forexConfig.js";
import {TransactionRouters} from "./Router/TransactionRouter.js";
import { StockRouters } from "./Router/StockRouters.js";



export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export let app = express();

// const API_PreFix = "/api/v1/auth";
const API_Prefix = "/api/v1"
// const API_Prefix_Auth = "/api/v1/auth"




app.use("/", express.static("./public/uploads"));

var corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
// Configure body-parser to handle post requests
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan("dev"));

morganBody(app, {
  prettify: true,
  logReqUserAgent: true,
  logReqDateTime: true,
});
// Connect To Database

await connectDB();
// Running Seeder
// RunSeeder();
app.get("/api/v1/forex", async (req, res) => {
  try {

    const { startDate,endDate } = req.query
    console.log(startDate,endDate)
    const data= await getForexData(startDate,endDate)
    console.log(data)
    return res.status(200).json({
      data, meessga: "Forex Data send successfuly"
    })
  } catch (err) {
    return res.status(400).json({
      meessga: err.meessga
    })
  }

});
// Routes
app.use(API_Prefix, AuthRouters);

app.use(API_Prefix, UserRouters);
app.use(API_Prefix, AdminRouters);
app.use(API_Prefix, TransactionRouters)
app.use(API_Prefix, StockRouters)
app.use(ResHandler);

