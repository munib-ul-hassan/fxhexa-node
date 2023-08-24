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

export const RequestValidator = joi.object({
  amount: joi.number(),
  stock: joi.string(),
  requestType: joi.string().valid("Buy", "Sell"),
  exchangeAmmount: joi.number()
})
export const updaterequestValidator = joi.object({

  status: joi.string().valid("cancelled", "accepted").required(),
  comment: joi.string(),

})