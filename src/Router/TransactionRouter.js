import { Router, application } from "express";
import TransactionController from "../Controller/TransacionController.js";
export const TransactionRouters = Router();

TransactionRouters.route("/transaction/buyCoin").post(
  TransactionController.buyCoin
);
