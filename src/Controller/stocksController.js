
import axios from "axios"
const getrealTimeData = async (req, res) => {
    try {
        const { ticket } = req.query
        // const url =`https://api.polygon.io/v3/trades/${ticket}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        // let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}&apikey=${process.env.alphaAPIKEY}`
        const url = `https://marketdata.tradermade.com/api/v1/live?api_key=HOUeS_8EtscpseQOOOtt&currency=${ticket}`


        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data: data.quotes[0], message: "data get successfully"
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

        const stockurl = `https://marketdata.tradermade.com/api/v1/live?api_key=HOUeS_8EtscpseQOOOtt&currency=AAPL,TSLA,GOOGL,fb,AMZN`
        // const stockurl = `https://marketdata.tradermade.com/api/v1/live?api_key=HOUeS_8EtscpseQOOOtt&currency=NFLX,AAPL,TSLA,GOOGL,fb,AMZN`

        const stockdata = (await axios.get(stockurl)).data
        stockdata.quotes[0]["symbol"] = "NASDAQ:AAPL"
        stockdata.quotes[1]["symbol"] = "NASDAQ:TSLA"
        stockdata.quotes[2]["symbol"] = "NASDAQ:GOOG"
        stockdata.quotes[3]["symbol"] = "NASDAQ:META"
        stockdata.quotes[4]["symbol"] = "NASDAQ:AMZN"

        // NYSE:IBM
        // NASDAQ:AAPL
        // NASDAQ:TSLA
        // NASDAQ:GOOG
        // NASDAQ:META
        // NASDAQ:AMZN

        // TVC%3AGOLD
        // NASDAQ%3ASSIC
        // CAPITALCOM:COPPER
        // CAPITALCOM:PLATINUM

        // TVC:USOIL

        const forexurl = `https://marketdata.tradermade.com/api/v1/live?api_key=HOUeS_8EtscpseQOOOtt&currency=USDX,UK100,GER30,SPX500,FRA40,JPN225,ESP35,NAS100,USA30,HKG33,AUS200`
        const forexdata = (await axios.get(forexurl)).data

        const metalsurl = `https://marketdata.tradermade.com/api/v1/live?api_key=HOUeS_8EtscpseQOOOtt&currency=XAUUSD,XAGUSD,XPTUSD,Nymex,NATGAS`
        const metalsdata = (await axios.get(metalsurl)).data
        metalsdata.quotes[0]["symbol"] = "TVC%3AGOLD"
        metalsdata.quotes[1]["symbol"] = "NASDAQ%3ASSIC"
        metalsdata.quotes[2]["symbol"] = "CAPITALCOM:PLATINUM"
        metalsdata.quotes[3]["symbol"] = "TVC:USOIL"


        return res.json({
            status: true,
            data: {
                "stock": stockdata.quotes,
                "forex": forexdata.quotes,
                "metals": metalsdata.quotes,

            }, message: "data get successfully"
        })
    } catch (error) {

        return res.json({
            status: false,
            message: error.message
        })
    }
}
const StockController = {

    getrealTimeData,
    getData
    // getStocks,
    // getExchanges



};
export default StockController;