import axios from "axios";
import TransactionModel from "../DB/Model/transactionModel.js";
import AuthModel from "../DB/Model/authModel.js";
import UserModel from "../DB/Model/userModel.js";
import {
  buyCoinValidator,
  sellCoinValidator,
} from "../Utils/Validator/transactionValidation.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
// Buy Coin API
const buyCoin = async (req, res, next) => {
  const { error } = buyCoinValidator.validate(req.body);
  if (error) {
    return next(CustomError.badRequest(error.details[0].message));
  }

  const { price, accountTag, userId } = req.body;
  let balance = 0;

  const userData = await UserModel.findById(userId);

  const authId = userData.auth.toHexString();

  const authData = await AuthModel.findById(authId);

  if (accountTag === "demo") {
    balance = authData.demoBalance;
  } else {
    balance = authData.realBalance;
  }

  if (price <= balance) {
    // Perform the buy transaction
    balance -= price;

    // Store the transaction data
    const previousBalance =
      accountTag === "demo" ? authData.demoBalance : authData.realBalance;
    const transaction = new TransactionModel({
      userId: userId,
      previousBalance,
      newBalance: balance,
      transactionAmount: price,
      accountTag, // Add your account tag if applicable
      transactionType: "buy",
    });
    await transaction.save();

    // Update the balance
    const updateData =
      accountTag === "demo"
        ? { demoBalance: balance }
        : { realBalance: balance };
    await AuthModel.findByIdAndUpdate(authId, updateData);

    return res.json({
      message: "Coin purchased successfully.",
      newBalance: balance,
    });
  } else {
    return res
      .status(400)
      .json({ error: "Insufficient balance to buy the coin." });
  }
};

/// SEll Coin API
const sellCoin = async (req, res, next) => {
  const { error } = sellCoinValidator.validate(req.body);
  if (error) {
    return next(CustomError.badRequest(error.details[0].message));
  }
  const { price, accountTag, userId } = req.body;
  let balance = 0;

  const userData = await UserModel.findById(userId);

  const authId = userData.auth.toHexString();

  const authData = await AuthModel.findById(authId);

  if (accountTag === "demo") {
    balance = authData.demoBalance;
  } else {
    balance = authData.realBalance;
  }

  // Perform the buy transaction
  balance += price;

  // Store the transaction data
  const previousBalance =
    accountTag === "demo" ? authData.demoBalance : authData.realBalance;
  const transaction = new TransactionModel({
    userId: userId,
    previousBalance,
    newBalance: balance,
    transactionAmount: price,
    accountTag, // Add your account tag if applicable
    transactionType: "sell",
  });
  await transaction.save();

  // Update the balance
  const updateData =
    accountTag === "demo" ? { demoBalance: balance } : { realBalance: balance };
  await AuthModel.findByIdAndUpdate(authId, updateData);

  return res.json({
    message: "Coin sold successfully.",
    newBalance: balance,
  });
};

const getTransactions = async (req, res, next) => {
  try {
    const {
      transactionType,
      month,
      date,
      year,
      time,
      page,
      limit,
      accountTag,
    } = req.query;
    const query = { userId: req.params.userId };

    // Filter based on transaction type (buy or sell)
    if (transactionType) {
      query.transactionType = transactionType;
    }
    // Filter based on accountTag type (demo or real)
    if (accountTag) {
      query.accountTag = accountTag;
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
          $lt: new Date(`${year}-${month}-${date + 1}`),
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
      .skip(skipCount)
      .limit(itemsPerPage);

    // Send the transactions data as a JSON response
    return res.json({
      transactionsData: transactions,
    });
  } catch (error) {
    // If an error occurs during the process, pass it to the error handling middleware
    return next(error);
  }
};

const TransactionController = {
  buyCoin,
  sellCoin,
  getTransactions,
};

export default TransactionController;
