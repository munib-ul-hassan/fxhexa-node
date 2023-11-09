
import axios from "axios"
const getrealTimeData = async (req, res) => {
    try {
        const { ticket } = req.query
        // const url =`https://api.polygon.io/v3/trades/${ticket}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        // let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}&apikey=${process.env.alphaAPIKEY}`
        const url = `https://marketdata.tradermade.com/api/v1/live?api_key=${process.env.apikey}&currency=${ticket}`


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

        const stockurl = `https://marketdata.tradermade.com/api/v1/live?api_key=${process.env.apikey}&currency=AAPL,TSLA,GOOGL,fb,AMZN`
        // const stockurl = `https://marketdata.tradermade.com/api/v1/live?api_key=${process.env.apikey}&currency=NFLX,AAPL,TSLA,GOOGL,fb,AMZN`

        const stockdata = (await axios.get(stockurl)).data
        stockdata.quotes[0] = {...stockdata.quotes[0], "label": "APPLE", "value": "NASDAQ:AAPL", "ticket": "AAPL"}
        stockdata.quotes[1] = {...stockdata.quotes[10], label: "TESLA", value: "NASDAQ:TSLA", ticket: "TSLA" }
        stockdata.quotes[2] = {...stockdata.quotes[2],label: "GOOGLE", value: "NASDAQ:GOOG", ticket: "GOOGL" }
        stockdata.quotes[3] = {...stockdata.quotes[3], label: "FACEBOOK", value: "NASDAQ:META", ticket: "FB"}
        stockdata.quotes[4] = {...stockdata.quotes[4],  label: "AMAZON", value: "NASDAQ:AMZN", ticket: "AMZN"}
        
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

        const forexurl = `https://marketdata.tradermade.com/api/v1/live?api_key=${process.env.apikey}&currency=USDX,UK100,GER30,SPX500,FRA40,JPN225,ESP35,NAS100,USA30,HKG33,AUS200`
        const forexdata = (await axios.get(forexurl)).data

        const metalsurl = `https://marketdata.tradermade.com/api/v1/live?api_key=${process.env.apikey}&currency=XAUUSD,XAGUSD,XPTUSD,Nymex,NATGAS`
        const metalsdata = (await axios.get(metalsurl)).data
        metalsdata.quotes[0] = {...metalsdata.quotes[0],label: "GOLD", value: "TVC%3AGOLD", ticket: "XAUUSD"}
        metalsdata.quotes[1] = {...metalsdata.quotes[10], label: "SILVER", value: "NASDAQ%3ASSIC", ticket: "XAGUSD"  }
        metalsdata.quotes[2] = {...metalsdata.quotes[2],label: "PLATINUM", value: "CAPITALCOM:PLATINUM", ticket: "XPTUSD"}
        metalsdata.quotes[3] = {...metalsdata.quotes[3],  label: "US OIL", value: "TVC:USOIL", ticket: "OIL" }

        // metalsdata.quotes[0]["symbol"] = "TVC%3AGOLD"
        // metalsdata.quotes[1]["symbol"] = "NASDAQ%3ASSIC"
        // metalsdata.quotes[2]["symbol"] = "CAPITALCOM:PLATINUM"
        // metalsdata.quotes[3]["symbol"] = "TVC:USOIL"


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