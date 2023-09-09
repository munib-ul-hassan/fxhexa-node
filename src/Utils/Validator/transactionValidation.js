import joi from "joi";

export const transactionValidator = joi.object({
  amount: joi.number().required(),
  stock: joi.string(),
  exchangeAmount:  joi.number().required(), 
  subAccId:  joi.string().required()
});



export const RequestValidator = joi.object({
  amount: joi.number(),  
  accountref:joi.string().required(),
  transactionID: joi.string(),
  paymentType:joi.valid("perfect","bank","bitcoin"),
  requestType:joi.valid("deposit", "withdraw")
})
export const updaterequestValidator = joi.object({

  status: joi.string().valid("cancelled", "accepted").required(),
  comment: joi.string(),

})