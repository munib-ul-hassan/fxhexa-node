import axios from "axios";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import { forexOpenOrderValidator, forexcloseOrderValidator } from "../Utils/Validator/orderValidation.js";
import subAccountModel from "../DB/Model/subAccountModel.js";
import AdminModel from "../DB/Model/adminModel.js";
import OrderModel from "../DB/Model/orderModel.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import AuthModel from "../DB/Model/authModel.js";

const gettickers = async (req, res, next) => {
    try {

        const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/forex/tickers?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data, message: "data get successfully"
        })

    } catch (err) {
        next(CustomError.createError(err.message, 500));

    }
}
const getgraph = async (req, res, next) => {
    try {
        const { series, from, to, ticket, range } = req.query
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticket}/range/${range}/${series}/${from}/${to}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data, message: "data get successfully"
        })

    } catch (error) {

        return next(CustomError.createError(error.message, 500));

    }
}
const openforex = async (req, res, next) => {
    try {
        if (!req.user.KYCstatus) {
            return next(CustomError.createError("Wait for admin KYC approval, then you can start your trade", 200));
          }
        const { error } = forexOpenOrderValidator.validate(req.body);
        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }
        const { from, to, amount, subAccId, orderType, stopLoss, profitLimit } = req.body
        const url = `https://api.polygon.io/v1/conversion/${from}/${to}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ&amount=${amount}&precision=2`
        const data = (await axios.get(url)).data

        const accData = await subAccountModel.findById(subAccId)
        if (!accData) {
            return next(CustomError.badRequest("invalid Sub-Account Id"));
        }
        const balance = data.converted + (data.converted * 0.15)
        if (accData.balance < balance) {
            return next(CustomError.badRequest("You have insufficient balance, kindly deposit and enjoying trading"));
        }
        if (req.user.referBy) {

            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                $inc: { balance: (data.converted * 0.10) }
            })

            await AuthModel.findOneAndUpdate({ _id: req.user.referBy, "referer.user": req.user._id }, {
                $inc: { "referer.$.amount": (data.converted * 0.05) }
            })
        } else {
            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                $inc: { balance: (data.converted * 0.15) }
            })

        }
        const Order = new OrderModel({
            user: req.user._doc.profile._id,
            accountref: accData._id,
            prevBalance: accData.balance,
            orderType,
            stopLoss, profitLimit,
            unit: amount,
            from, to, openAmount: data.converted, type: "Forex"
        })
        await Order.save()
        await subAccountModel.findByIdAndUpdate(subAccId, {
            $inc: { balance: -(data.converted + (data.converted * 0.15)) }
        })

        return next(
            CustomSuccess.createSuccess(
                Order,
                "Order open successfully",
                200
            )
        );
    } catch (error) {
        return next(CustomError.createError(error.message, 500));
    }
}
const closeforex = async (req, res, next) => {
    try {
        const { error } = forexcloseOrderValidator.validate(req.body);
        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }
        const { subAccId, orderId } = req.body;

        const accData = await subAccountModel.findById(subAccId, { password: 0 })
        if (!accData) {
            return next(CustomError.badRequest("invalid Sub-Account Id"));
        }
        const orderData = await OrderModel.findById(orderId)
        if (!orderData) {
            return next(CustomError.badRequest("invalid Order Id"));
        }
        const { from, to, unit } = orderData
        const url = `https://api.polygon.io/v1/conversion/${from}/${to}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ&amount=100&precision=2`
        const data = (await axios.get(url)).data

        var newBalance = 0;
        if (orderData.orderType == "buy") {

            newBalance = (orderData.openAmount - data.converted)+orderData.openAmount
        }
        if (orderData.orderType == "sell") {
            newBalance = (data.converted - orderData.openAmount)+orderData.openAmount
        }
        console.log(newBalance)
        await subAccountModel.findByIdAndUpdate(subAccId,
            {
                $inc: { balance: newBalance },
            })
        const updatedData = await OrderModel.findByIdAndUpdate(orderId, { status: "close", closeAmount: data.converted })
        return next(
            CustomSuccess.createSuccess(
                updatedData,
                "Order close successfully",
                200
            )
        );
    } catch (err) {
        return next(CustomError.createError(err.message, 500));

    }
}
const ForexController = {
    gettickers,
    getgraph,
    openforex,
    closeforex
};

export default ForexController;