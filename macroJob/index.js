
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
            var  url;
if(item.type=="Stock"){
    url =`https://live-rates.com/api/price?key=0de84abe68&rate=${item.stock}`
}else{
    url =`https://live-rates.com/api/price?key=0de84abe68&rate=${item.from}_${item.to}`
}


            var newBalance, closeAmount;
            
            try {

                closeAmount = (await axios.get(url)).data[0].ask
            } catch (e) {

            }
            const stocks = item.unit / item.openAmount

            if (item.orderType == "buy") {
                // newBalance = (item.openAmount - closeAmount) * item.unit
            newBalance = Number((item.openAmount - closeAmount)*stocks) 

            }
            if (item.orderType == "sell") {
            newBalance = Number((closeAmount - item.openAmount)*stocks) 

                // newBalance = (closeAmount - item.openAmount) * item.unit
            }
            if (newBalance <= item.stopLoss && newBalance >= item.profitLimit) {
                newBalance+=item.unit
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