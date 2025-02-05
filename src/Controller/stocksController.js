import axios from "axios";
import { appendFile } from "fs";
const getrealTimeData = async (req, res) => {
  try {
    const { ticket } = req.query;
    // const url =`https://api.polygon.io/v3/trades/${ticket}?apiKey=x5Vm09UZQ8XJpEL0SIgpKJxaROq8jgeQ`

    // let url = `https://www.alphavantage.co/query?function=${series}&symbol=${ticket}&interval=${min}&apikey=${process.env.alphaAPIKEY}`
    const url = `https://live-rates.com/api/price?key=${
      process.env.key
    }&rate=${ticket.replace("#", "%23")}`;

    const data = (await axios.get(url)).data;
    return res.json({
      status: true,
      data: data[0],
      message: "data get successfully",
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
};
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
const makeDelayedRequest = (url, delay) => {
  return new Promise((resolve, reject) => {
    
    setTimeout(async () => {
      try {
        const response = await axios.get(url);
        if (!response.data?.response) {
          console.log(response.data);
        }
        resolve(
          response.data?.response?.map((i) => {
            let { id, c, h, l, ch, cp, t, s, ccy, exch } = i;
            return {
              id,
              currency: c,
              rate: "",
              bid: "",
              ask: "",
              high: h,
              low: l,
              open: "",
              close: "",
              timestamp: t,
              exch,
            };
          })
        );
      } catch (error) {
        // console.log(url, error, "=================");
        // reject(error);
        reject(error);
      }
    }, delay);
  });
};

const getData = async (req, res) => {
  // old work
  // try {
  //   const stockurl = `https://live-rates.com/api/price?key=${process.env.key}&rate=%23APPLE,%23TESLA,GOOG.us,%23FACEBOOK,%23AMAZON`;
  //   let stockdata =await makeDelayedRequest(stockurl,1000)
  //   //  (await axios.get(stockurl)).data;
  //   if (stockdata) {
  //     stockdata[0] = {
  //       ...stockdata[0],
  //       label: "APPLE",
  //       value: "NASDAQ:AAPL",
  //       ticket: "AAPL",
  //     };
  //     stockdata[1] = {
  //       ...stockdata[1],
  //       label: "AMAZON",
  //       value: "NASDAQ:AMZN",
  //       ticket: "AMZN",
  //     };
  //     stockdata[2] = {
  //       ...stockdata[2],
  //       label: "TESLA",
  //       value: "NASDAQ:TSLA",
  //       ticket: "TSLA",
  //     };
  //     stockdata[3] = {
  //       ...stockdata[3],
  //       label: "FACEBOOK",
  //       value: "NASDAQ:META",
  //       ticket: "FB",
  //     };
  //     stockdata[4] = {
  //       ...stockdata[4],
  //       label: "GOOGLE",
  //       value: "NASDAQ:GOOG",
  //       ticket: "GOOGL",
  //     };
  //   }
  //   const forex = [
  //     "C:EURUSD,EUR_USD",
  //     "C:GBPUSD,GBP_USD",
  //     "C:EURJPY,EUR_JPY",
  //     "C:USDJPY,USD_JPY",
  //     "C:EURCHF,EUR_CHF",
  //     "C:USDCHF,USD_CHF",
  //     "C:AUDUSD,AUD_USD",
  //     "C:USDCAD,USD_CAD",
  //     "C:EURGBP,EUR_GBP",
  //     "C:EURAUD,EUR_AUD",
  //     "C:GBPCHF,GBP_CHF",
  //     "C:GBPJPY,GBP_JPY",
  //     "C:AUDNZD,AUD_NZD",
  //     "C:AUDCAD,AUD_CAD",
  //     "C:AUDJPY,AUD_JPY",
  //     "C:EURNZD,EUR_NZD",
  //     "C:EURCAD,EUR_CAD",
  //     "C:GBPCAD,GBP_CAD",
  //     "C:GBPAUD,GBP_AUD",
  //     "C:GBPNZD,GBP_NZD",
  //   ];
  //   const forexurl = `https://live-rates.com/api/price?key=${
  //     process.env.key
  //   }&rate=${forex
  //     .map((item) => {
  //       return item.split(":")[1].split(",")[1];
  //     })
  //     .join(",")}`;

  //   let forexdata = [...(await makeDelayedRequest(forexurl,1000))].map((item, i) => {
  //     return { ...item, symbol: forex[i].split(",")[0] };
  //   });

  //   // const metalsurl = `https://live-rates.com/api/price?key=${process.env.key}&rate=GOLD,SILVER,PLATINUM`;
  //   // let metalsdata = (await makeDelayedRequest(metalsurl,1000));
  //   // metalsdata[0] = {
  //   //   ...metalsdata[0],
  //   //   label: "GOLD",
  //   //   value: "TVC%3AGOLD",
  //   //   ticket: "XAUUSD",
  //   // };
  //   // metalsdata[1] = {
  //   //   ...metalsdata[1],
  //   //   label: "SILVER",
  //   //   value: "TVC:SILVER",
  //   //   ticket: "XAGUSD",
  //   // };
  //   // metalsdata[2] = {
  //   //   ...metalsdata[2],
  //   //   label: "PLATINUM",
  //   //   value: "CAPITALCOM:PLATINUM",
  //   //   ticket: "XPTUSD",
  //   // };

  //   // const oilurl = `https://live-rates.com/api/price?key=${process.env.key}&rate=USOil,UKOil`;
  //   // let oildata = (await makeDelayedRequest(oilurl,1000));
  //   // oildata[0] = {
  //   //   ...oildata[0],
  //   //   label: "US OIL",
  //   //   value: "TVC:USOIL",
  //   //   ticket: "OIL",
  //   // };
  //   // oildata[1] = {
  //   //   ...oildata[1],
  //   //   label: "UK OIL",
  //   //   value: "TVC:UKOIL",
  //   //   ticket: "OILD",
  //   // };

  //   return res.json({
  //     status: true,
  //     data: {
  //       stock: stockdata,
  //       forex: forexdata,
  //       // metals: metalsdata,
  //       // oil: oildata,
  //     },
  //     message: "data get successfully",
  //   });
  // } catch (error) {
  //   return res.json({
  //     status: false,
  //     message: error.message,
  //   });
  // }

  try {
    const stockurl = `https://fcsapi.com/api-v3/stock/latest?id=15,101,38,112,56,50,134&access_key=${process.env.fcsapikey}`;

    let stockdata = await makeDelayedRequest(stockurl, 1000);
    //  (await axios.get(stockurl)).data;
    let stocks=[];
    if (stockdata) {
      stocks[1] = {
        ...stockdata.filter((i)=>{return i.id == 15})[0],
        label: "APPLE",
        value: "NASDAQ:AAPL",
        ticket: "AAPL",
      };
      stocks[2] = {
        ...stockdata.filter((i)=>{return i.id == 56})[0],
        label: "AMAZON",
        value: "NASDAQ:AMZN",
        ticket: "AMZN",
      };
      stocks[3] = {
        ...stockdata.filter((i)=>{return i.id == 101})[0],

        label: "TESLA",
        value: "NASDAQ:TSLA",
        ticket: "TSLA",
      };
      stocks[4] = {
        ...stockdata.filter((i)=>{return i.id == 112})[0],

        label: "FACEBOOK",
        value: "NASDAQ:META",
        ticket: "FB",
      };
      stocks[0] = {
        ...stockdata.filter((i)=>{return i.id == 56})[0],

        label: "GOOGLE",
        value: "NASDAQ:GOOG",
        ticket: "GOOGL",
      };
    }
    const forex = [
      ["C:EURUSD,EUR_USD", 1],
      ["C:GBPUSD,GBP_USD", 39],
      ["C:EURJPY,EUR_JPY", 3],
      ["C:USDJPY,USD_JPY", 20],
      ["C:EURCHF,EUR_CHF", 2],
      ["C:USDCHF,USD_CHF", 19],
      ["C:AUDUSD,AUD_USD", 13],
      ["C:USDCAD,USD_CAD", 18],
      ["C:EURGBP,EUR_GBP", 4],
      ["C:EURAUD,EUR_AUD", 12],
      ["C:GBPCHF,GBP_CHF", 141],
      ["C:GBPJPY,GBP_JPY", 113],
      ["C:AUDNZD,AUD_NZD", 114],
      ["C:AUDCAD,AUD_CAD", 16],
      ["C:AUDJPY,AUD_JPY", 14],
      ["C:EURNZD,EUR_NZD", 5],
      ["C:EURCAD,EUR_CAD", 6],
      ["C:GBPCAD,GBP_CAD", 40],
      ["C:GBPAUD,GBP_AUD", 48],
      ["C:GBPNZD,GBP_NZD", 42],
    ];
    const forexurl = `https://fcsapi.com/api-v3/forex/latest?access_key=${
      process.env.fcsapikey
    }&id=${forex
      .map((item) => {
        return item[1];
      })
      .join(",")}`;

    let forexdata = [...(await makeDelayedRequest(forexurl, 1000))].map(
      (item, i) => {
        return { ...item, symbol: forex[i][0].split(",")[0] };
      }
    );

    const metalsurl = `https://fcsapi.com/api-v3/forex/latest?access_key=${process.env.fcsapikey}&id=1984,1975,1987`;
    let metalsdata = await makeDelayedRequest(metalsurl, 1000);
    if (metalsdata?.length > 0) {
      metalsdata[0] = {
        ...metalsdata[0],
        label: "GOLD",
        value: "TVC%3AGOLD",
        ticket: "XAUUSD",
      };
      metalsdata[1] = {
        ...metalsdata[1],
        label: "SILVER",
        value: "TVC:SILVER",
        ticket: "XAGUSD",
      };
      metalsdata[2] = {
        ...metalsdata[2],
        label: "PLATINUM",
        value: "CAPITALCOM:PLATINUM",
        ticket: "XPTUSD",
      };
    }

    // const oilurl = `https://fcsapi.com/api-v3/stock/latest?id=50,134&access_key=${process.env.fcsapikey}`;
    // let oildata = (await makeDelayedRequest(oilurl,1000));
    // console.log(oildata)
    let oildata = [];
    oildata[0] = {
      ...stockdata.filter((i)=>{return i.id == 50})[0],


      label: "US OIL",
      value: "TVC:USOIL",
      ticket: "OIL",
    };
    oildata[1] = {
      ...stockdata.filter((i)=>{return i.id == 134})[0],


      label: "UK OIL",
      value: "TVC:UKOIL",
      ticket: "OILD",
    };

    return res.json({
      status: true,
      data: {
        stock: stocks,
        forex: forexdata,
        metals: metalsdata,
        oil: oildata,
      },
      message: "data get successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: false,
      message: error.message,
    });
  }
};
const getstocklist = async (req, res) => {
  try {
    const url = `https://live-rates.com/api/rates?key=${process.env.key}`;

    const data = (await axios.get(url)).data;
    return res.json({
      status: true,
      data: data,
      message: "data get successfully",
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
};
const StockController = {
  getrealTimeData,
  getData,
  getstocklist,
  // getStocks,
  // getExchanges
};
export default StockController;
