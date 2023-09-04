import joi from "joi";

export const transactionValidator = joi.object({
  amount: joi.number().required(),
  stock: joi.string(),
  exchangeAmount:  joi.number().required(), 
});



export const RequestValidator = joi.object({
  amount: joi.number(),
  stock: joi.string(),
  requestType: joi.valid("Buy", "Sell", "Deposit"),
  exchangeAmount: joi.number(),
  transactionID: joi.string(),
  paymentType:joi.valid("perfect","bank","bitcoin")
})
export const updaterequestValidator = joi.object({

  status: joi.string().valid("cancelled", "accepted").required(),
  comment: joi.string(),

})