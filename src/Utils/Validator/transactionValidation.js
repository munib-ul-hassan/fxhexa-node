import joi from "joi";

export const buyCoinValidator = joi.object({
  transactionAmount: joi.number().required(),  
  accountTag: joi.string().valid("demo", "real"),
  coin: joi.string().required(),
  transactionType:joi.string().valid("buy", "sell")
});

export const sellCoinValidator = joi.object({
  price: joi.number().required(),
  userId: joi.string().required(),
  accountTag: joi.string().required(),
});
