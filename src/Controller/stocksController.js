
import axios from "axios"
const getrealTimeData = async (req, res) => {
    try {
        const { ticket } = req.query
        // const url =`https://api.polygon.io/v3/trades/${ticket}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        // let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}&apikey=${process.env.alphaAPIKEY}`
        const url = `https://live-rates.com/api/price?key=26ac8692be&rate=${ticket.replace("#","%23")}`


        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data: data[0], message: "data get successfully"
        })

    } catch (error) {


        return res.json({
            status: false,
            message: error.message
        })
    }
}
// const getStocks = async (req, res) => {
//     try {
//         const { keyword } = req.query
//         // let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${process.env.alphaAPIKEY}`

//         const url = `https://api.polygon.io/v3/reference/tickers?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ&search=${keyword}`

//         const data = (await axios.get(url)).data
//         return res.json({
//             status: true,
//             data, message: "data get successfully"
//         })

//     } catch (error) {


//         return res.json({
//             status: false,
//             message: error.message
//         })
//     }
// }
// const getExchanges = async (req, res) => {
//     try {
//         const { asset ,local} = req.query

//         let url = `https://api.polygon.io/v3/reference/exchanges?asset_class=${asset}&locale=${local}&apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

//         const data = (await axios.get(url)).data
//         return res.json({
//             status: true,
//             data, message: "data get successfully"
//         })

//     } catch (error) {


//         return res.json({
//             status: false,
//             message: error.message
//         })
//     }
// }
const getData = async (req, res) => {
    try {
        
        const stockurl = `https://live-rates.com/api/price?key=26ac8692be&rate=%23APPLE,%23TESLA,GOOG.us,%23FACEBOOK,%23AMAZON`
        let stockdata = (await axios.get(stockurl)).data
        stockdata[0] = { ...stockdata[0], "label": "APPLE", "value": "NASDAQ:AAPL", "ticket": "AAPL" }
        stockdata[4] = { ...stockdata[1], label: "AMAZON", value: "NASDAQ:AMZN", ticket: "AMZN" }
        stockdata[1] = { ...stockdata[2], label: "TESLA", value: "NASDAQ:TSLA", ticket: "TSLA" }
        stockdata[3] = { ...stockdata[3], label: "FACEBOOK", value: "NASDAQ:META", ticket: "FB" }
        stockdata[2] = { ...stockdata[4], label: "GOOGLE", value: "NASDAQ:GOOG", ticket: "GOOGL" }

        const forex = [
            "C:EURUSD,EUR_USD",
            "C:GBPUSD,GBP_USD",
            "C:EURJPY,EUR_JPY",
            "C:USDJPY,USD_JPY",
            "C:EURCHF,EUR_CHF",         
            "C:USDCHF,USD_CHF",           
            "C:AUDUSD,AUD_USD",
            "C:USDCAD,USD_CAD",
            "C:EURGBP,EUR_GBP",
            "C:EURAUD,EUR_AUD",
            "C:GBPCHF,GBP_CHF",
            "C:GBPJPY,GBP_JPY",
            "C:AUDNZD,AUD_NZD",
            "C:AUDCAD,AUD_CAD",
            "C:AUDJPY,AUD_JPY",
            "C:EURNZD,EUR_NZD",
            "C:EURCAD,EUR_CAD",
            "C:GBPCAD,GBP_CAD",
            "C:GBPAUD,GBP_AUD",
            "C:GBPNZD,GBP_NZD",
        ]
        const forexurl = `https://live-rates.com/api/price?key=26ac8692be&rate=${forex.map((item)=>{return item.split(':')[1].split(",")[1]}).join(",")}`
        
        let forexdata = (await axios.get(forexurl)).data.map((item,i)=>{
            return {...item,symbol:forex[i].split(",")[0]}
        })

        


        const metalsurl = `https://live-rates.com/api/price?key=26ac8692be&rate=GOLD,SILVER,PLATINUM`
        let metalsdata = (await axios.get(metalsurl)).data
        metalsdata[0] = { ...metalsdata[0], label: "GOLD", value: "TVC%3AGOLD", ticket: "XAUUSD" }
        metalsdata[1] = { ...metalsdata[1], label: "SILVER", value: "NASDAQ%3ASSIC", ticket: "XAGUSD" }
        metalsdata[2] = { ...metalsdata[2], label: "PLATINUM", value: "CAPITALCOM:PLATINUM", ticket: "XPTUSD" }

        const oilurl = `https://live-rates.com/api/price?key=26ac8692be&rate=USOil,UKOil`
        let oildata = (await axios.get(oilurl)).data
        oildata[0] = { ...oildata[0], label: "US OIL", value: "TVC:USOIL", ticket: "OIL" }
        oildata[1] = { ...oildata[1], label: "UK OIL", value: "TVC:UKOIL", ticket: "OILD" }



        return res.json({
            status: true,
            data: {
                "stock": stockdata,
                "forex": forexdata,
                "metals": metalsdata,
                "oil": oildata
            }, message: "data get successfully"
        })
    } catch (error) {

        return res.json({
            status: false,
            message: error.message
        })
    }
}
const getstocklist = async(req,res)=>{
    try{
        const url = `https://live-rates.com/api/rates?key=26ac8692be`


        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data: data, message: "data get successfully"
        })

    }catch (error) {

        return res.json({
            status: false,
            message: error.message
        })
    }
}
const StockController = {

    getrealTimeData,
    getData,
    getstocklist
    // getStocks,
    // getExchanges



};
export default StockController;