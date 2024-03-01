import axios from "axios";

import OrderModel from "../DB/Model/orderModel.js";
import AuthModel from "../DB/Model/authModel.js";

import {
  closeOrderValidator,
  openOrderValidator
} from "../Utils/Validator/orderValidation.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import subAccountModel from "../DB/Model/subAccountModel.js";
import AdminModel from "../DB/Model/adminModel.js";
// Buy Coin API

const open = async (req, res, next) => {
  try {

    const { error } = openOrderValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { unit, orderType, stock, subAccId, openAmount, stopLoss, profitLimit, status ,forex} = req.body;

    const accData = await subAccountModel.findById(subAccId)
    if (!accData) {
      return next(CustomError.badRequest("invalid Sub-Account Id"));
    }




    // const balance = openAmount * unit
   
    const tax = Number(unit / 0.01) * 0.15

    if (status == "pending") {

      const Order = new OrderModel({
        user: req.user._doc.profile._id,
        accountref: accData._id,
        prevBalance: accData.balance, unit, stock,forex,
        orderType, openAmount,
        unit,
        stopLoss, profitLimit,
        status: "pending",

      })
      await Order.save()


      console.log(req.user);

      
      await subAccountModel.findByIdAndUpdate(subAccId, {
        $inc: { balance: -Number(tax) }
      })
      return next(
        CustomSuccess.createSuccess(
          Order,
          "Order open successfully",
          200
        )
      );
    }
  
    if (accData.balance < tax) {
      return next(CustomError.badRequest("You have insufficient balance, kindly deposit and enjoying trading"));
    }
    if (req.user.referBy) {
console.log("accData.type",accData.type)
      if(accData.type != "demo" ){

      await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
        $inc: { balance: Number(Number(unit / 0.01) * 0.10) }
      })

      await AuthModel.findOneAndUpdate({ _id: req.user.referBy, "referer.user": req.user._id }, {
        $inc: { "referer.$.amount": Number(Number(unit / 0.01) * 0.05) }
      })}
    } else {
      await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
        $inc: { balance: Number(Number(unit / 0.01) * 0.15) }
      })
    }

    // newBalance: Number(accData.balance) - Number(exchangeAmount), exchangeAmount, orderType: "buy"

    const Order = new OrderModel({
      user: req.user._doc.profile._id,
      accountref: accData._id,
      prevBalance: accData.balance, unit, stock,forex,
      orderType, openAmount,
      stopLoss, profitLimit,
      status: "open"
    })
    await Order.save()
    await subAccountModel.findByIdAndUpdate(subAccId, {
      $inc: { balance: -Number(tax) }
    })

    return next(
      CustomSuccess.createSuccess(
        Order,
        "Order open successfully",
        200
      )
    );
  } catch (error) {
console.log(error)
    next(CustomError.createError(error.message, 500));
  }
};

/// SEll Coin API
const close = async (req, res, next) => {
  try {
    const { error } = closeOrderValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { subAccId, orderId, closeAmount, amount } = req.body;

    const accData = await subAccountModel.findById(subAccId, { password: 0 })
    if (!accData) {
      return next(CustomError.badRequest("invalid Sub-Account Id"));
    }
    var success = 0, failed = 0;

    await Promise.all(orderId.map(async (item) => {

      const orderData = await OrderModel.findOne({ _id: item })
      if (!orderData) {
        failed++;
        return;
      }
      // var newBalance = 0;

      // if (orderData.orderType == "buy") {


      //   newBalance = (Number(orderData.openAmount - closeAmount) * orderData.unit)+Number(orderData.openAmount * orderData.unit)
      // }

      // if (orderData.orderType == "sell") {
      //   newBalance = (Number(closeAmount - orderData.openAmount) * orderData.unit)+Number(orderData.openAmount * orderData.unit) 
      // }

      await subAccountModel.findByIdAndUpdate(subAccId,
        {
          $inc: { balance: amount },
        })
      await OrderModel.findByIdAndUpdate(item, { status: "close", closeAmount })
      success++;
    }))

    return next(
      CustomSuccess.createSuccess(
        { success, failed },
        "Order close successfully",
        200
      )
    );
  } catch (error) {
    console.log(error)
    next(CustomError.createError(error.message, 500));
  }
}

const getOrder = async (req, res, next) => {
  try {
    const {
      orderType,
      page,
      limit,
      subAccId,
      from,
      to

    } = req.query;
    const query = { user: req.user._doc.profile._id };

    // Filter based on Order type (buy or sell)
    if (orderType) {
      query.orderType = orderType;
      delete req.query.orderType
    }

    if (subAccId) {
      query.accountref = subAccId;
      delete req.query.subAccId

    }
    if (from && to) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(from) || !datePattern.test(to)) {
        return
        next(CustomError.createError("Invalid date format", 200));
      }
      query.createdAt = {
        $gte: from, $lte: to
      }
      delete req.query.from
      delete req.query.to

    }

    // Filter based on the specified month
    // if (month) {
    //   const parsedMonth = Number(month);
    //   if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
    //     query.createdAt = {
    //       $gte: new Date(`${year}-${month}-01`),
    //       $lt: new Date(`${year}-${month}-31`),
    //     };
    //   }
    // }

    // Filter based on the specified date and year
    // if (date && year) {
    //   const parsedDate = Number(date);
    //   const parsedYear = Number(year);
    //   if (!isNaN(parsedDate) && !isNaN(parsedYear)) {
    //     query.createdAt = {
    //       $gte: new Date(`${year}-${month}-${date}`),
    //       $lt: new Date(`${year}-${month}-${Number(date) + 1}`),
    //     };
    //   }
    // }

    // Filter based on the specified time
    // if (time) {
    //   query.createdAt = { $gte: new Date(`${year}-${month}-${date}T${time}`) };
    // }

    // Pagination
    const pageNumber = Number(page) || 1;
    const itemsPerPage = Number(limit) || 10;
    const skipCount = (pageNumber - 1) * itemsPerPage;

    // Fetch Orders from the database based on the constructed query and pagination
    const Orders = await OrderModel.find({ ...query, ...req.query })
      .populate("user")
      .sort({ _id: -1 })

    let ordersdata;
    if (Orders.length > 0) {
      if (limit == 0) {

        ordersdata = {
          open: Orders.filter((item) => {
            return item.status == "open"
          }),
          close: Orders.filter((item) => {
            return item.status == "close"
          }),
          pending: Orders.filter((item) => {
            return item.status == "pending"
          })
        }
      } else {
        ordersdata = {
          open: Orders.filter((item) => {
            return item.status == "open"
          }).slice(0, limit),
          close: Orders.filter((item) => {
            return item.status == "close"
          }).slice(0, limit),
          pending: Orders.filter((item) => {
            return item.status == "pending"
          }).slice(0, limit)
        }
      }


      return next(
        CustomSuccess.createSuccess(
          ordersdata,
          "Orders get successfully",
          200
        )
      );
    } else {
      return next(
        CustomSuccess.createSuccess(
          {},
          "No any data yet",
          200
        )
      );

    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
const updateorder = async (req, res, next) => {
  try {
    const { id } = req.params

    const orderData = await OrderModel.findOne({ _id: id, user: req.user.profile._id, status: {$ne:"close"} })
    
    if (!orderData) {

      return next(CustomError.badRequest("invalid Id or this order already be closed"));



    }
    const { stopLoss, profitLimit } = req.body
    const updateorder = await OrderModel.findOneAndUpdate({ _id: id }, {
      stopLoss, profitLimit
    })
    if (updateorder) {
      return next(
        CustomSuccess.createSuccess(
          {},
          "Order updated successfully",
          200
        )
      );
    } else {
      return next(
        CustomSuccess.createSuccess(
          {},
          "Order updation failed",
          200
        )
      );
    }

  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
const OrderController = {
  open,
  close,
  getOrder,
  updateorder
};

export default OrderController;
