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

import {OrderRouters} from "./Router/OrderRouter.js";

import { RequestRouters } from "./Router/requestRoutes.js";



export const filename = fileURLToPath(import.meta.url);
export const dirname = path.dirname(filename);

export let app = express();

// const API_PreFix = "/api/v1/auth";
const API_Prefix = "/api/v1"
// const API_Prefix_Auth = "/api/v1/auth"




app.use("/", express.static("./public/uploads"));

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

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

// Routes
app.use(API_Prefix, AuthRouters);
app.use(API_Prefix, UserRouters);
app.use(API_Prefix, AdminRouters);
app.use(API_Prefix, OrderRouters)
app.use(API_Prefix, RequestRouters)

app.use(ResHandler);

