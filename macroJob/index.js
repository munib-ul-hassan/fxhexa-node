
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


        const data = await OrderModel.find({ status: "pending" })
        data.map(async (item) => {



            var newBalance, closeAmount;
            const url = `https://marketdata.tradermade.com/api/v1/live?api_key=${process.env.apikey}&currency=${item.stock}`
            try {

                closeAmount = (await axios.get(url)).data.quotes[0].ask
            } catch (e) {

            }

            if (item.orderType == "buy") {
                newBalance = (item.openAmount - closeAmount) * item.unit
            }
            if (item.orderType == "sell") {
                newBalance = (closeAmount - item.openAmount) * item.unit
            }
            if (newBalance <= item.stopLoss && newBalance >= item.profitLimit) {

                await subAccountModel.findByIdAndUpdate(item.accountref,
                    {
                        $inc: { balance: newBalance },
                    })
                await OrderModel.findByIdAndUpdate(item, { status: "close", closeAmount })
            }



        })
    } catch (err) {

    }

});
app.listen(port, () => {
    console.log(`Server 1 is running on port ${port}`);
});