
import cron from "node-cron"
import axios from "axios"

// DB Connection
import { connectDB } from "./DB/index.js";
import express from "express";
import OrderModel from "./DB/Model/orderModel.js";
import subAccountModel from "./DB/Model/subAccountModel.js";
connectDB()


const app = express();
const port = 3001;

app.get('/', (req, res) => {
    res.send('Server 1 is running!');
});


cron.schedule('* * * * *', async () => {
    try {
        console.log("CRON Running")
        const data = await OrderModel.find({ status: "pending" }).populate({ path: "user", poplate: { path: "auth" } }).populate("accountref")
        data.map(async (item) => {
            let url = `htps://live-rates.com/api/price?key=${process.env.key}&rate=${item.stock}`


            var newBalance, closeAmount;

            try {

                closeAmount = (await axios.get(url)).data[0].ask
            } catch (e) {

            }

            var newBalance = 0;
            if (item.orderType == "buy") {
                newBalance = (Number(item.openAmount - closeAmount) * item.unit) + Number(item.openAmount * item.unit)


            }
            if (item.orderType == "sell") {
                newBalance = (Number(closeAmount - item.openAmount) * item.unit) + Number(item.openAmount * item.unit)
            }
            let blnc;
            if (newBalance < 0) {
                blnc = -newBalance
            } else {
                blnc = newBalance
            }
            if (blnc <= item.stopLoss && blnc >= item.profitLimit) {

                await subAccountModel.findByIdAndUpdate(item.accountref,
                    {
                        $inc: { balance: newBalance },
                    })
                await OrderModel.findByIdAndUpdate(item, { status: "close", closeAmount })
            }



        })
    } catch (err) {
console.log("Error on CRON",err)
    }

});
app.listen(port, () => {
    console.log(`Server 1 is running on port ${port}`);
});