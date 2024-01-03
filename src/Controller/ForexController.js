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
        const { error } = forexOpenOrderValidator.validate(req.body);
        if (error) {
            return next(CustomError.badRequest(error.details[0].message));
        }
        const { from, to, subAccId, orderType, stopLoss, profitLimit, status, openAmount, unit } = req.body

        const accData = await subAccountModel.findById(subAccId)
        if (!accData) {
            return next(CustomError.badRequest("invalid Sub-Account Id"));
        }

        const balance = openAmount * unit
        const tax = Number(unit / 0.01) * 0.15

        if (accData.balance < (balance + tax)) {
            return next(CustomError.badRequest("You have insufficient balance, kindly deposit and enjoying trading"));
        }
        if (req.user.referBy) {

            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                $inc: { balance: Number(Number(unit / 0.01) * 0.10) }
            })

            await AuthModel.findOneAndUpdate({ _id: req.user.referBy, "referer.user": req.user._id }, {
                $inc: { "referer.$.amount": Number(Number(unit / 0.01) * 0.05) }
            })
        } else {
            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                $inc: { balance: Number(Number(unit / 0.01) * 0.15) }
            })

        }
        await subAccountModel.findByIdAndUpdate(subAccId, {
            $inc: { balance: -Number(balance + tax) }
        })
        if (status == "pending") {
            const Order = new OrderModel({
                user: req.user._doc.profile._id,
                accountref: accData._id,
                prevBalance: accData.balance,
                orderType, unit,
                stopLoss, profitLimit,
                from, to, openAmount, type: "Forex",
                status: "pending"
            })
            await Order.save()
            return next(
                CustomSuccess.createSuccess(
                    Order,
                    "Order open successfully",
                    200
                )
            );
        }
        // const url = `https://api.polygon.io/v1/conversion/${from}/${to}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ&amount=${amount}&precision=2`
        // const url = `https://live-rates.com/api/price?key=${process.env.key}&rate=${from}_${to}`

        // const data = (await axios.get(url)).data



        const Order = new OrderModel({
            user: req.user._doc.profile._id,
            accountref: accData._id,
            prevBalance: accData.balance,
            orderType,
            stopLoss, profitLimit, unit,
            from, to, openAmount, type: "Forex",
            status: "open"
        })
        await Order.save()


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
        const { subAccId, orderId, closeAmount, amount } = req.body;

        const accData = await subAccountModel.findById(subAccId, { password: 0 })
        if (!accData) {
            return next(CustomError.badRequest("invalid Sub-Account Id"));
        }
        var success = 0, failed = 0;

        await Promise.all(orderId.map(async (item) => {

            const orderData = await OrderModel.findById(item)
            if (!orderData) {
                failed++;
                return;
            }
            // if (!orderData) {
            //     return next(CustomError.badRequest("invalid Order Id"));
            // }
            // const { from, to, unit } = orderData
            // // const url = `https://api.polygon.io/v1/conversion/${from}/${to}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ&amount=100&precision=2`

            // var newBalance = 0;
            // if (orderData.orderType == "buy") {
            //     newBalance = Number((orderData.openAmount - closeAmount) * unit )+Number(orderData.openAmount * orderData.unit)
            // }
            // if (orderData.orderType == "sell") {
            //     newBalance = Number((closeAmount - orderData.openAmount) * unit)+Number(orderData.openAmount * orderData.unit)
            // }

            await subAccountModel.findByIdAndUpdate(subAccId,
                {
                    $inc: { balance: amount },
                })
            await OrderModel.findByIdAndUpdate(item, { status: "close", closeAmount: closeAmount }, { new: true })
            success++;
        }))
        return next(
            CustomSuccess.createSuccess(
                { success, failed },
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