import joi from "joi";

export const buyCoinValidator = joi.object({
  price: joi.number().required(),
  userId: joi.string().required(),
  accountTag: joi.string().required(),
});

export const sellCoinValidator = joi.object({
  price: joi.number().required(),
  userId: joi.string().required(),
  accountTag: joi.string().required(),
});
