import joi from "joi";

export const openOrderValidator = joi.object({
  unit: joi.number().required(),
  stock: joi.string(),  
  forex: joi.string(),  

  openAmount: joi.number().required(),
  orderType: joi.string().valid("buy", "sell"),
  status: joi.string().valid("pending", "open"),
  subAccId: joi.string().required(),
  stopLoss: joi.number(),
  profitLimit: joi.number()
});


export const forexOpenOrderValidator = joi.object({
  unit: joi.number().required(),
  openAmount: joi.number(),
  from: joi.string(),
  to: joi.string(),
  orderType: joi.string().valid("buy", "sell"),
  subAccId: joi.string().required(),
  stopLoss: joi.number(),
  profitLimit: joi.number(),
  status: joi.string().valid("pending", "open"),

});

export const forexcloseOrderValidator = joi.object({  
  orderId:  joi.array(),  
  subAccId: joi.string().required(),
  closeAmount:joi.number().required(),
  amount:joi.number().required(),
});

export const closeOrderValidator = joi.object({
  // unit: joi.number(),
  // stock: joi.string(),
  orderId: joi.array(),
  closeAmount: joi.number().required(),
  // orderType: joi.string().valid("buy", "sell"),
  subAccId: joi.string().required(),
  amount:joi.number().required(),


});



export const RequestValidator = joi.object({
  amount: joi.number(),
  accountref: joi.string(),
  transactionID: joi.string(),
  paymentCode: joi.string(),
  paymentType: joi.string(),
  requestType: joi.valid("deposit", "withdraw","referel")
})
export const updaterequestValidator = joi.object({

  status: joi.string().valid("cancelled", "accepted").required(),
  comment: joi.string(),

})