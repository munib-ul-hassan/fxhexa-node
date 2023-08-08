import joi from "joi";

export const buyCoinValidator = joi.object({
  transactionAmount: joi.number().required(),
  accountTag: joi.string().valid("demo", "real"),
  // from: joi.string().required(),
  coinBuy: joi.string().required(),
  // transactionType: joi.string().valid("buy", "sell"),
});

export const sellCoinValidator = joi.object({
  transactionAmount: joi.number().required(),
  accountTag: joi.string().valid("demo", "real"),
  // from: joi.string().required(),
  coinSell: joi.string().required(),
  // transactionType: joi.string().valid("buy", "sell"),
});
