import TransactionModel from "../DB/Model/transactionModel.js";
import AuthModel from "../DB/Model/authModel.js";
import UserModel from "../DB/Model/userModel.js";
import coinModel from "../DB/Model/coinsModel.js";
import {
  buyCoinValidator,
  sellCoinValidator,
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

    const { transactionAmount, accountTag, coinBuy } = req.body;

    /// Check if coin exists or not in coins table
    const fromCoin = await coinModel.findOne({ coin: "BTCUSDT" });

    if (!fromCoin) {
      return next(
        CustomError.createError(
          "From which you are buying, Coin not found",
          404
        )
      );
    }

    //// Check account from COin in demo or real array
    if (accountTag === "demo") {
      const demoCoin = await AuthModel.findOne({
        _id: req.user._id,
        demo: {
          $elemMatch: { coin: fromCoin._id },
        },
      });
      if (!demoCoin) {
        await AuthModel.findByIdAndUpdate(req.user._id, {
          $push: { demo: { coin: fromCoin._id } },
        });
      }
    } else {
      const realCoin = await AuthModel.findOne({
        _id: req.user._id,
        real: {
          $elemMatch: { coin: fromCoin._id },
        },
      });
      if (!realCoin) {
        await AuthModel.findByIdAndUpdate(req.user._id, {
          $push: { real: { coin: fromCoin._id } },
        });
      }
    }
    //// Do transaction for buy for demo account

    if (accountTag == "demo") {
      // Check if the transactionAmount is less than the amount of the "from" coin
      const checkAmount = await AuthModel.findOne(
        { _id: req.user._id, "demo.coin": fromCoin._id },
        { "demo.$": 1 }
      );

      //// Response if balance is less then transactioAmount
      if (checkAmount.demo[0].ammount < transactionAmount) {
        return next(
          CustomError.createError("Insufficient balance to buy the coin", 200)
        );
      } else {
        /// Check if to coin exists or not in coins table
        const toCheckCoin = await coinModel.findOne({ coin: coinBuy });

        if (!toCheckCoin) {
          return next(
            CustomError.createError("The coin you are buying is not found", 404)
          );
        }

        // Check if the "to" coin exists in the user's demo array, and add if necessary
        const toCoin = await AuthModel.findOne({
          _id: req.user._id,
          demo: {
            $elemMatch: { coin: toCheckCoin._id },
          },
        });

        if (!toCoin) {
          await AuthModel.findByIdAndUpdate(req.user._id, {
            $push: { demo: { coin: toCheckCoin._id } },
          });
        }

        //////Do transaction

        ///////////Update Balance in from Coin
        await AuthModel.updateOne(
          { _id: req.user._id, "demo.coin": fromCoin._id },
          { $inc: { "demo.$.ammount": -transactionAmount } }
        );
        ///////////Update Balance in to Coin
        await AuthModel.updateOne(
          { _id: req.user._id, "demo.coin": toCheckCoin._id },
          { $inc: { "demo.$.ammount": +transactionAmount } }
        );

        // Create and save transaction
        const transaction = new TransactionModel({
          user: req.user._doc.profile,
          // from: from,
          coin: coinBuy,
          transactionAmount: transactionAmount,
          accountTag: accountTag,
          transactionType: "buy",
        });
        await transaction.save();

        return next(
          CustomSuccess.createSuccess(
            transaction,
            "Transaction completed successfully",
            200
          )
        );
      }
    }
    /////////////// DO transaction for buy with real account

    if (accountTag == "real") {
      // Check if the transactionAmount is less than the amount of the "from" coin
      const checkAmount = await AuthModel.findOne(
        { _id: req.user._id, "real.coin": fromCoin._id },
        { "real.$": 1 }
      );

      //// Response if balance is less then transactioAmount
      if (checkAmount.real[0].ammount < transactionAmount) {
        return next(
          CustomError.createError("Insufficient balance to buy the coin", 200)
        );
      } else {
        /// Check if to coin exists or not in coins table
        const toCheckCoin = await coinModel.findOne({ coin: coinBuy });

        if (!toCheckCoin) {
          return next(
            CustomError.createError("The coin you are buying is not found", 404)
          );
        }

        // Check if the "to" coin exists in the user's demo array, and add if necessary
        const toCoin = await AuthModel.findOne({
          _id: req.user._id,
          real: {
            $elemMatch: { coin: toCheckCoin._id },
          },
        });

        if (!toCoin) {
          await AuthModel.findByIdAndUpdate(req.user._id, {
            $push: { real: { coin: toCheckCoin._id } },
          });
        }

        //////Do transaction

        ///////////Update Balance in from Coin
        await AuthModel.updateOne(
          { _id: req.user._id, "real.coin": fromCoin._id },
          { $inc: { "real.$.ammount": -transactionAmount } }
        );
        ///////////Update Balance in to Coin
        await AuthModel.updateOne(
          { _id: req.user._id, "real.coin": toCheckCoin._id },
          { $inc: { "real.$.ammount": +transactionAmount } }
        );

        // Create and save transaction
        const transaction = new TransactionModel({
          user: req.user._doc.profile,
          // from: from,
          coin: coinBuy,
          transactionAmount: transactionAmount,
          accountTag: accountTag,
          transactionType: "buy",
        });
        await transaction.save();

        return next(
          CustomSuccess.createSuccess(
            transaction,
            "Transaction completed successfully",
            200
          )
        );
      }
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
};

/// SEll Coin API
const sellCoin = async (req, res, next) => {
  try {
    const { error } = sellCoinValidator.validate(req.body);
    if (error) {
      return next(CustomError.badRequest(error.details[0].message));
    }

    const { transactionAmount, accountTag, coinSell } = req.body;

    /// Check if coin exists or not in coins table
    const fromCoin = await coinModel.findOne({ coin: coinSell });

    if (!fromCoin) {
      return next(
        CustomError.createError(
          "Coin you are selling not found in coin table",
          404
        )
      );
    }

    //// Do transaction for buy for demo account

    if (accountTag == "demo") {
      // Check if the transactionAmount is less than the amount of the "from" coin

      const CheckCoin = await AuthModel.findOne({
        _id: req.user._id,
        demo: {
          $elemMatch: { coin: fromCoin._id },
        },
      });

      if (!CheckCoin) {
        return next(
          CustomError.createError("Insufficient balance to sell the coin", 200)
        );
      }

      const checkAmount = await AuthModel.findOne(
        { _id: req.user._id, "demo.coin": fromCoin._id },
        { "demo.$": 1 }
      );

      // console.log(checkAmount, CheckCoin, "checkAmount");

      //// Response if balance is less then transactioAmount
      if (checkAmount.demo[0].ammount < transactionAmount) {
        return next(
          CustomError.createError("Insufficient balance to sell the coin", 200)
        );
      } else {
        //////Do transaction

        ///////////Update Balance in from Coin
        await AuthModel.updateOne(
          { _id: req.user._id, "demo.coin": fromCoin._id },
          { $inc: { "demo.$.ammount": -transactionAmount } }
        );
        ///////////Update Balance in to Coin

        const btcusdtCoin = await coinModel.findOne({ coin: "BTCUSDT" });

        await AuthModel.updateOne(
          { _id: req.user._id, "demo.coin": btcusdtCoin._id },
          { $inc: { "demo.$.ammount": +transactionAmount } }
        );

        // Create and save transaction
        const transaction = new TransactionModel({
          user: req.user._doc.profile,
          // from: from,
          coin: coinSell,
          transactionAmount: transactionAmount,
          accountTag: accountTag,
          transactionType: "sell",
        });
        await transaction.save();

        return next(
          CustomSuccess.createSuccess(
            transaction,
            "Transaction completed successfully",
            200
          )
        );
      }
    }
    /////////////// DO transaction for buy with real account

    if (accountTag == "real") {
      // Check if the transactionAmount is less than the amount of the "from" coin

      const CheckCoin = await AuthModel.findOne({
        _id: req.user._id,
        real: {
          $elemMatch: { coin: fromCoin._id },
        },
      });

      if (!CheckCoin) {
        return next(
          CustomError.createError("Insufficient balance to sell the coin", 200)
        );
      }

      const checkAmount = await AuthModel.findOne(
        { _id: req.user._id, "real.coin": fromCoin._id },
        { "real.$": 1 }
      );

      // console.log(checkAmount, CheckCoin, "checkAmount");

      //// Response if balance is less then transactioAmount
      if (checkAmount.demo[0].ammount < transactionAmount) {
        return next(
          CustomError.createError("Insufficient balance to sell the coin", 200)
        );
      } else {
        //////Do transaction

        ///////////Update Balance in from Coin
        await AuthModel.updateOne(
          { _id: req.user._id, "real.coin": fromCoin._id },
          { $inc: { "real.$.ammount": -transactionAmount } }
        );
        ///////////Update Balance in to Coin

        const btcusdtCoin = await coinModel.findOne({ coin: "BTCUSDT" });

        await AuthModel.updateOne(
          { _id: req.user._id, "real.coin": btcusdtCoin._id },
          { $inc: { "real.$.ammount": +transactionAmount } }
        );

        // Create and save transaction
        const transaction = new TransactionModel({
          user: req.user._doc.profile,
          // from: from,
          coin: coinSell,
          transactionAmount: transactionAmount,
          accountTag: accountTag,
          transactionType: "sell",
        });
        await transaction.save();

        return next(
          CustomSuccess.createSuccess(
            transaction,
            "Transaction completed successfully",
            200
          )
        );
      }
    }
  } catch (error) {
    next(CustomError.createError(error.message, 500));
  }
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
  buyCoin,
  sellCoin,
  getTransactions,
};

export default TransactionController;
