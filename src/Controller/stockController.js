import axios from "axios"

const getrealTimeData = async (req, res) => {
    try{
    const { series, min, ticket } = req.query
    let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}min&apikey=${process.env.alphaAPIKEY}`
    console.log(url)
    const data = (await axios.get(url)).data
    return res.json({
        data, message: "data get successfully"
    })

} catch (error) {
       
    
    return next(CustomError.badRequest(error.message));
  }
}
const getStocks =async (req,res)=>{
    try{
        const { keyword } = req.query
        let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${process.env.alphaAPIKEY}`
        console.log(url)
        const data = (await axios.get(url)).data
        return res.json({
            data, message: "data get successfully"
        })

    } catch (error) {
       
    
        return next(CustomError.badRequest(error.message));
      }
}
const StockController = {

    getrealTimeData,
    getStocks
  
  };
  export default StockController;
  