import axios from "axios";
import CustomError from "../Utils/ResponseHandler/CustomError.js";

const gettickers = async (req, res, next) => {
    try {

        const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/forex/tickers?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data, message: "data get successfully"
        })

    } catch (err) {
        next(CustomError.createError(err.message, 500));

    }
}
const getgraph = async (req, res, next) => {
    try {
        const { series, from,to, ticket,range } = req.query
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticket}/range/${range}/${series}/${from}/${to}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

        const data = (await axios.get(url)).data
        return res.json({
            status: true,
            data, message: "data get successfully"
        })

    } catch (error) {
        
        next(CustomError.createError(error.message, 500));

    }
}


const ForexController = {
    gettickers,
    getgraph
};

export default ForexController;