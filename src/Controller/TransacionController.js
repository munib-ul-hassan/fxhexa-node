import TransactionModel from "../DB/Model/transactionModel.js";
import AuthModel from "../DB/Model/authModel.js";

import {
  transactionValidator
} from "../Utils/Validator/transactionValidation.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import subAccountModel from "../DB/Model/subAccountModel.js";
// Buy Coin API

const purchase = async (req, res, next) => {
  try {
    const { error } = transactionValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { amount, exchangeAmount, stock, subAccId } = req.body;

    const accData = await subAccountModel.findById(subAccId,{password:0})
    if (!accData) {
      return next(CustomError.badRequest("invalid Sub-Account Id"));

    }
    if (accData.balance < exchangeAmount) {
      return next(CustomError.badRequest("You have insufficient balance, kindly deposit and enjoying trading"));

    }
    const transaction = new TransactionModel({
      user: req.user._doc.profile._id,
      accountref: accData._id,
      prevBalance: accData.balance, amount, stock, subAccId,
      newBalance: parseInt(accData.balance) - parseInt(exchangeAmount), exchangeAmount, transactionType: "buy"
    })
    await transaction.save()
    const i = accData.stockData.findIndex((element) => element.stock == stock)
    let stockdemodata = accData.stockData;


    if (i != -1) {

      stockdemodata[i].amount = stockdemodata[i].amount + amount

    } else {
      stockdemodata = [...stockdemodata, {
        stock, amount
      }]
    }

    const updatedAuth = await subAccountModel.findOneAndUpdate({
      _id: subAccId
    },
      {
        $inc: { balance: -exchangeAmount },
        stockData: stockdemodata


      }, { new: true });

    return next(
      CustomSuccess.createSuccess(
        updatedAuth,
        "Transaction completed successfully",
        200
      )
    );
  } catch (error) {
    console.log(error);
    next(CustomError.createError(error.message, 500));
  }
};

/// SEll Coin API
const sell = async (req, res, next) => {
  try {
    const { error } = transactionValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }
    const { amount, exchangeAmount, stock, subAccId } = req.body;

    const accData = await subAccountModel.findById(subAccId,{password:0})
    if (!accData) {
      return next(CustomError.badRequest("invalid Sub-Account Id"));
    }
  
    
    const i = accData.stockData.findIndex((element) => element.stock == stock)

    if (i == -1) {
      return next(CustomError.badRequest("You have No any unit of this stock"));

    }
    if (amount > accData.stockData[i].amount) {
      return next(CustomError.badRequest("You have insufficient stock"));
    }

    const transaction = new TransactionModel({
      user: req.user._doc.profile._id,
      prevBalance: accData.balance, amount, stock,
      accountref:subAccId,
      newBalance: parseInt(accData.balance) + parseInt(exchangeAmount), exchangeAmount, transactionType: "sell"
    })
    await transaction.save()
    let stockdemodata = accData.stockData;
    stockdemodata[i].amount = stockdemodata[i].amount - amount

    const updatedAuth = await subAccountModel.findOneAndUpdate({
      _id: subAccId
    },
      {
        $inc: { balance: exchangeAmount },
        stockData: stockdemodata

      }, { new: true });

    return next(
      CustomSuccess.createSuccess(
        updatedAuth,
        "Transaction completed successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};
const getTransaction = async (req, res, next) => {
  try {
    const {
      transactionType,
      month,
      date,
      year,
      time,
      page,
      limit,
      subAccId

    } = req.query;
    const query = { user: req.user._doc.profile._id };

    // Filter based on transaction type (buy or sell)
    if (transactionType) {
      query.transactionType = transactionType;
    }


    // Filter based on the specified month
    if (month) {
      const parsedMonth = parseInt(month);
      if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
        query.createdAt = {
          $gte: new Date(`${year}-${month}-01`),
          $lt: new Date(`${year}-${month}-31`),
        };
      }
    }

    // Filter based on the specified date and year
    if (date && year) {
      const parsedDate = parseInt(date);
      const parsedYear = parseInt(year);
      if (!isNaN(parsedDate) && !isNaN(parsedYear)) {
        query.createdAt = {
          $gte: new Date(`${year}-${month}-${date}`),
          $lt: new Date(`${year}-${month}-${parseInt(date) + 1}`),
        };
      }
    }

    // Filter based on the specified time
    if (time) {
      query.createdAt = { $gte: new Date(`${year}-${month}-${date}T${time}`) };
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const skipCount = (pageNumber - 1) * itemsPerPage;

    // Fetch transactions from the database based on the constructed query and pagination
    const transactions = await TransactionModel.find(query)
      .populate("user")
      .skip(skipCount)
      .limit(itemsPerPage);

    // Send the transactions data as a JSON response

    return next(
      CustomSuccess.createSuccess(
        transactions,
        "Transactions get successfully",
        200
      )
    );
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const TransactionController = {
  purchase,
  sell,
  getTransaction,
};

export default TransactionController;
