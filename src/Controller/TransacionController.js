import axios from "axios";
import TransactionModel from "../DB/Model/transactionModel.js";
import AuthModel from "../DB/Model/authModel.js";
import { buyCoinValidator } from "../Utils/Validator/transactionValidation.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";

const buyCoin = async (req, res, next) => {
  const { error } = buyCoinValidator.validate(req.body);
  if (error) {
    return next(CustomError.badRequest(error.details[0].message));
  }

  const { price, accountTag, authId } = req.body;
  let balance = 0;

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

const TransactionController = {
  buyCoin,
};

export default TransactionController;
