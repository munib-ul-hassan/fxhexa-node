
import TransactionModel from "../DB/Model/transactionModel.js";
import AuthModel from "../DB/Model/authModel.js";
import UserModel from "../DB/Model/userModel.js";
import {
  buyCoinValidator
  
} from "../Utils/Validator/transactionValidation.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
// Buy Coin API
const buyCoin = async (req, res, next) => {
  try {


    const { error } = buyCoinValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }

    const { transactionAmount, accountTag, from,to, transactionType } = req.body;

    let previousBalance, newBalance = 0;



    if (accountTag === "demo") {
      previousBalance = req.user._doc.demoBalance;
    } else {
      previousBalance = req.user._doc.realBalance;
    }
    if ((transactionType == "sell" && transactionAmount <= previousBalance) || (transactionType == "buy" && transactionAmount > 0)) {
      // Perform the buy transaction
      if (transactionType == "buy") {
        newBalance = previousBalance + transactionAmount
      } else {
        newBalance = previousBalance - transactionAmount

      }

      const transaction = new TransactionModel({
        user: req.user._doc.profile,
        previousBalance,
        newBalance, from,to,
        transactionAmount,
        accountTag, // Add your account tag if applicable
        transactionType,
      });
      await transaction.save();


      // Store the transaction data


      // Update the balance
      const updateData =
        accountTag === "demo"
          ? { demoBalance: newBalance }
          : { realBalance: newBalance };
      await AuthModel.findByIdAndUpdate(req.user._id, updateData);
      return next(
        CustomSuccess.createSuccess(
          transaction,
          "Transaction completed successfully",
          200
        )
      );

    } else {
      return next(CustomError.createError("Insufficient balance to buy the coin", 200));

    }

  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }

};

/// SEll Coin API
// const sellCoin = async (req, res, next) => {
//   const { error } = sellCoinValidator.validate(req.body);
//   if (error) {
//     return next(CustomError.badRequest(error.details[0].message));
//   }
//   const { price, accountTag, userId } = req.body;
//   let balance = 0;

//   const userData = await UserModel.findById(userId);

//   const authId = userData.auth.toHexString();

//   const authData = await AuthModel.findById(authId);

//   if (accountTag === "demo") {
//     balance = authData.demoBalance;
//   } else {
//     balance = authData.realBalance;
//   }

//   // Perform the buy transaction
//   balance += price;

//   // Store the transaction data
//   const previousBalance =
//     accountTag === "demo" ? authData.demoBalance : authData.realBalance;
//   const transaction = new TransactionModel({
//     userId: userId,
//     previousBalance,
//     newBalance: balance,
//     transactionAmount: price,
//     accountTag, // Add your account tag if applicable
//     transactionType: "sell",
//   });
//   await transaction.save();

//   // Update the balance
//   const updateData =
//     accountTag === "demo" ? { demoBalance: balance } : { realBalance: balance };
//   await AuthModel.findByIdAndUpdate(authId, updateData);

//   return res.json({
//     message: "Coin sold successfully.",
//     newBalance: balance,
//   });
// };

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
    const query = { user: req.user._doc.profile };

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
    const transactions = await TransactionModel.find(query).populate("user")
      .skip(skipCount)
      .limit(itemsPerPage);

    // Send the transactions data as a JSON response

    return next(
      CustomSuccess.createSuccess(
        transactions,
        "Transactions get successfully",
        200
      ))

  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

const TransactionController = {
  buyCoin,
  // sellCoin,
  getTransactions,
};

export default TransactionController;
