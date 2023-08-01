import joi from "joi";

export const buyCoinValidator = joi.object({
  price: joi.number().required(),
  authId: joi.string().required(),
  accountTag: joi.string().required(),
});
