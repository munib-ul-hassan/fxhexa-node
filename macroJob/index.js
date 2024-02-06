
import cron from "node-cron"
import axios from "axios"

// DB Connection
import { connectDB } from "./DB/index.js";
import express from "express";
import OrderModel from "./DB/Model/orderModel.js";
import subAccountModel from "./DB/Model/subAccountModel.js";
import AdminModel from "../src/DB/Model/adminModel.js";
import AuthModel from "../src/DB/Model/authModel.js";
connectDB()


const app = express();
const port = 3001;

app.get('/', (req, res) => {
    res.send('Server 1 is running!');
});


cron.schedule('* * * * *', async () => {
    try {
        console.log("Job run ")
        const data = await OrderModel.aggregate([
            { $match: { status: { $ne: "close" }, profitLimit: { $ne: null }, stopLoss: { $ne: null } ,openAmount: { $ne: null } ,unit: { $ne: null } } }
            ,
            {
                $lookup: {
                    from: "subaccs",
                    localField: "accountref",
                    foreignField: "_id",
                    as: "accountref"
                }
            },
            {
                $unwind: "$accountref" // If "accountref" is an array (result of $lookup)
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user" // If "user" is an array (result of $lookup)
            },
            {
                $lookup: {
                    from: "auths",
                    localField: "accountref.auth",
                    foreignField: "_id",
                    as: "accountref.auth"
                }
            },

        ]);

        data.map(async (item) => {
            let url;
            if (item.stock) {

                url = `https://live-rates.com/api/price?key=${process.env.key}&rate=${item.stock}`
            } else {
                url = `https://live-rates.com/api/price?key=${process.env.key}&rate=${item.from}_${item.to}`

            }

            var closeAmount;
            try {
                if(item.orderType == "buy"){

                    closeAmount = (await axios.get(url)).data[0].bid
                }else{
                    
                    closeAmount = (await axios.get(url)).data[0].ask
                }
            } catch (e) {

                return;
            }

            if (item.status == "pending") {
                const accData = item.accountref


                const tax = Number(item.unit / 0.01) * 0.15

                if (accData?.balance < tax) {
                    //   return next(CustomError.badRequest("You have insufficient balance, kindly deposit and enjoying trading"))
                    return;
                }
                if (item.orderType == "buy" && closeAmount >= item.openAmount) {

                    console.log("pending buy hit")

                    if (item.accountref.type != "demo") {
                        if (item.accountref.auth.referBy) {

                            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                                $inc: { balance: Number(Number(item.unit / 0.01) * 0.10) }
                            })

                            await AuthModel.findOneAndUpdate({ _id: item.accountref.auth.referBy, "referer.user": item.accountref.auth._id }, {
                                $inc: { "referer.$.amount": Number(Number(item.unit / 0.01) * 0.05) }
                            })
                        } else {

                            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                                $inc: { balance: Number(Number(item.unit / 0.01) * 0.15) }
                            })
                        }
                        await subAccountModel.findByIdAndUpdate(item.accountref._id,
                            {
                                $inc: { balance: -Number(tax) },
                            })
                    }

                    await OrderModel.findByIdAndUpdate(item._id, { status: "open" })
                    console.log("order open for the user :", item.user.fullName)

                }
                if (item.orderType == "sell" && closeAmount <= item.openAmount ) {

                    console.log("pending sell hit")



                    if (item.accountref.type != "demo") {

                        if (item.accountref.auth.referBy) {

                            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                                $inc: { balance: Number(Number(item.unit / 0.01) * 0.10) }
                            })

                            await AuthModel.findOneAndUpdate({ _id: item.accountref.auth.referBy, "referer.user": item.accountref.auth._id }, {
                                $inc: { "referer.$.amount": Number(Number(item.unit / 0.01) * 0.05) }
                            })
                        } else {

                            await AdminModel.findOneAndUpdate({ fullName: "admin" }, {
                                $inc: { balance: Number(Number(item.unit / 0.01) * 0.15) }
                            })
                        }

                        await subAccountModel.findByIdAndUpdate(item.accountref._id,
                            {
                                $inc: { balance: -Number(tax) },
                            })
                    }
                    await OrderModel.findByIdAndUpdate(item._id, { status: "open" })
                    console.log("order open for the user :", item.user.fullName)
                }


            }
            if (item.status == "open") {
                let amount;


                if (item.orderType == "buy" && ((item.profitLimit >= closeAmount && item.profitLimit != 0) || (item.stopLoss <= closeAmount && item.stopLoss != 0))) {
                    amount = (item.openAmount - closeAmount) * item.unit
                   
                    console.log("open buy hit")
                    if (item.accountref.type != "demo") {

                        await subAccountModel.findByIdAndUpdate(item.accountref._id,
                            {
                                $inc: { balance: Number(amount) },
                            })
                    }
                    await OrderModel.findByIdAndUpdate(item._id, { status: "close", closeAmount })
                    console.log("order close for the user :", item.user.fullName, "with the amount of", closeAmount)

                }
                if (item.orderType == "sell" && ((item.profitLimit <= closeAmount  && item.profitLimit != 0 )|| (item.stopLoss >= closeAmount && item.stopLoss != 0)) && item.openAmount) {

                    console.log("open sell hit")

                    amount = (closeAmount - item.openAmount) * item.unit
                    if (item.accountref.type != "demo") {

                        await subAccountModel.findByIdAndUpdate(item.accountref._id,
                            {
                                $inc: { balance: Number(amount) },
                            })
                    }
                    await OrderModel.findByIdAndUpdate(item._id, { status: "close", closeAmount })
                    console.log("order close for the user :", item.user.fullName, "with the amount of", closeAmount)
                }
            }
        })
    } catch (err) {
        console.log("Error on CRON", err)
    }
});
app.listen(port, () => {

    console.log(`Server 1 is running on port ${port}`);
});