
import axios from "axios"
const getrealTimeData = async (req, res) => {
    try {
        const { ticket } = req.query
        // const url =`https://api.polygon.io/v3/trades/${ticket}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        // let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}&apikey=${process.env.alphaAPIKEY}`
        const url = `https://marketdata.tradermade.com/api/v1/live?api_key=3kF-SBzjBWupGgMVxM5C&currency=${ticket}`


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
//         console.log(url)
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
//         console.log(url)
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
        // [
        //     stocks:[
        //         {
        //             tesla:{
        //                 ....all tesla data from api
        //             },
        //         },
        //         ....all stocks data
        //     ],
        //     forex: [
        //         {
        //             AEDUSD:{
        //                 ....all AEDUSD  data from api
        //             },
        //         },
        //         ....all forex data
        //     ],
        //     metals:[
        //         {
        //             GOLD:{
        //                 ....all gold data from api
        //             },
        //         },
        //         ....all metals data
        //     ],
        // ]
        const stockurl = `https://marketdata.tradermade.com/api/v1/live?api_key=3kF-SBzjBWupGgMVxM5C&currency=NFLX,AAPL,TSLA,GOOGL,fb,AMZN`
        const stockdata = (await axios.get(stockurl)).data
        const forexurl = `https://marketdata.tradermade.com/api/v1/live?api_key=3kF-SBzjBWupGgMVxM5C&currency=USDX,UK100,GER30,SPX500,FRA40,JPN225,ESP35,NAS100,USA30,HKG33,AUS200`
        const forexdata = (await axios.get(forexurl)).data
        const metalsurl = `https://marketdata.tradermade.com/api/v1/live?api_key=3kF-SBzjBWupGgMVxM5C&currency=XAUUSD,XAGUSD,XPTUSD,Nymex,NATGAS`
        const metalsdata = (await axios.get(metalsurl)).data

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