
import axios from "axios"
const getrealTimeData = async (req, res) => {
    try {
        const { series, min, ticket } = req.query
        let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}min&apikey=${process.env.alphaAPIKEY}`
        // const url =`https://api.polygon.io/v3/trades/${ticket}?apiKey=${process.env.apiKey}`
        console.log(url)

        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data, message: "data get successfully"
        })

    } catch (error) {


        return res.json({
            status: false,
            message: error.message
        })
    }
}
const getStocks = async (req, res) => {
    try {
        const { keyword } = req.query
        // let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${process.env.alphaAPIKEY}`
        
        const url =`https://api.polygon.io/v3/reference/tickers?apiKey=${process.env.apiKey}&search=${keyword}`
        console.log(url)
        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data, message: "data get successfully"
        })

    } catch (error) {


        return res.json({
            status: false,
            message: error.message
        })
    }
}
// const getExchanges = async (req, res) => {
//     try {
//         const { asset ,local} = req.query

//         let url = `https://api.polygon.io/v3/reference/exchanges?asset_class=${asset}&locale=${local}&apiKey=${process.env.apiKey}`
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
const StockController = {

    getrealTimeData,
    getStocks,
    // getExchanges



};
export default StockController;