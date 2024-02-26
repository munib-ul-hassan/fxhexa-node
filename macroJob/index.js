
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


cron.schedule('* * * * * *', async () => {


    function formatNumberDigit(inputNumber, i) {
        // Convert the input number to a string
        const numString = inputNumber?.toString();
    
        // Check if the input has a decimal point
        const decimalIndex = numString?.indexOf(".");
    
        const decimalafter = numString?.split(".")[1];
        const decimalafterLength = decimalafter?.length;
    
        // Calculate the number of decimal digits
        const decimalDigits =
          decimalIndex !== -1 ? numString?.length - decimalIndex - 1 : inputNumber;
    
        const maxDigit = Math.pow(10, Math.max(0, decimalDigits));
    
        const multiplier = maxDigit * inputNumber;
    
        if (i < 2) {
          console.log("decimalafter", decimalafter);
        }
    
        let result = 0;
    
        if (decimalafterLength == 2) {
          result = multiplier * 1000;
        } else if (decimalafterLength == 1) {
          result = multiplier * 10000;
        } else {
          result = inputNumber * 10000;
        }
    
        return result;
      }
    
      function formatNumberDigit2(inputNumber, i) {
        // Convert the input number to a string
        const numString = inputNumber?.toString();
    
        // Check if the input has a decimal point
        const decimalIndex = numString?.indexOf(".");
    
        const decimalafter = numString?.split(".")[1];
        const decimalafterLength = decimalafter?.length;
    
        // Calculate the number of decimal digits
        const decimalDigits =
          decimalIndex !== -1 ? numString?.length - decimalIndex - 1 : inputNumber;
    
        const maxDigit = Math.pow(10, Math.max(0, decimalDigits));
    
        const multiplier = maxDigit * inputNumber;
    
        let result = 0;
    
        if (decimalafterLength == 2) {
          result = multiplier * 10;
        } else if (decimalafterLength == 1) {
          result = multiplier * 100;
        } else {
          result = multiplier * 100;
        }
    
        return result;
      }
    
      function formatNumberDigit3(inputNumber) {
        // Convert the input number to a string
        const numString = inputNumber?.toString();
    
        // Check if the input has a decimal point
        const decimalIndex = numString?.indexOf(".");
    
        const decimalafter = numString?.split(".")[1];
        const decimalafterLength = decimalafter?.length;
    
        // Calculate the number of decimal digits
        const decimalDigits =
          decimalIndex !== -1 ? numString?.length - decimalIndex - 1 : inputNumber;
    
        const maxDigit = Math.pow(10, Math.max(0, decimalDigits));
    
        const multiplier = maxDigit * inputNumber;
    
        let result = 0;
    
        if (decimalafterLength == 2) {
          result = multiplier * 7;
        } else if (decimalafterLength == 1) {
          result = multiplier * 70;
        } else {
          result = multiplier * 70;
        }
    
        return result;
      }
    

const calculateProfitLoss = (currentOpen, item ) =>{
    const profitLoss =
                  Number(currentOpen).toFixed(4) -
                  Number(item.openAmount)?.toFixed(4);
                const newUnit = (item?.unit * 100)?.toFixed(4);

                let profitLossNew = 0;

                function countNumbersBeforeDecimal(inputNumber) {
                  // Convert the input number to a string
                  const numString = Math.abs(inputNumber).toString();

                  const decimalIndex = numString.indexOf(".");

                  return decimalIndex === -1 ? -1 : decimalIndex;
                }
                const befPoint = countNumbersBeforeDecimal(item?.openAmount);

                if (item.type == "Stock" && befPoint != 2) {
                  profitLossNew = Number(profitLoss * newUnit);
                } else {
                  if (befPoint == 1) {
                    const newVal = formatNumberDigit(item?.unit, 1);

                    profitLossNew = Number(profitLoss * newVal);
                  } else if (befPoint == 2) {
                    const newVal = formatNumberDigit2(item?.unit, 2);
                    profitLossNew = Number(profitLoss * newVal);
                  } else if (befPoint == 3) {
                    const newVal = formatNumberDigit3(item?.unit);
                    profitLossNew = Number(profitLoss * newVal);
                  }
                }

                return profitLossNew * item.orderType == "buy" ? 1 : -1
}

    try {
        // console.log("Job run ")
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

            if (item.status == "pending" && item.openAmount) {
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
            if (item.status == "open" && item.openAmount) {
                let amount;


                if (item.orderType == "buy" && ((item.profitLimit >= closeAmount && item.profitLimit != 0))) {


                    
                    amount = calculateProfitLoss(item.profitLimit, item)
                   
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
                if (item.orderType == "buy" && ( (item.stopLoss <= closeAmount && item.stopLoss != 0))) {
                    amount = calculateProfitLoss(item.stopLoss, item)
                   
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


                if (item.orderType == "sell" && ((item.profitLimit <= closeAmount  && item.profitLimit != 0 ))) {

                    console.log("open sell hit")

                    amount = calculateProfitLoss(item.profitLimit, item)
                    
                    if (item.accountref.type != "demo") {

                        await subAccountModel.findByIdAndUpdate(item.accountref._id,
                            {
                                $inc: { balance: Number(amount) },
                            })
                    }
                    await OrderModel.findByIdAndUpdate(item._id, { status: "close", closeAmount })
                    console.log("order close for the user :", item.user.fullName, "with the amount of", closeAmount)
                }
                if (item.orderType == "sell" && ((item.stopLoss >= closeAmount && item.stopLoss != 0))) {
                    
                    console.log("open sell hit")
                    amount = calculateProfitLoss(item.stopLoss, item)

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