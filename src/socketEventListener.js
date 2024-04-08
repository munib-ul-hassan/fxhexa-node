import * as io from "socket.io-client";

// import { ios } from "./app";
// var io = require('socket.io-client');

export const socketEventListner = (socket) => {
  var api_key = "LLX0sjT8Bq67o297GXAwcTxvW"; // get from https://fcsapi.com/dashboard
  var currency_ids = "15,101,38,112,56,50,134";

  var client = io.connect("wss://fcsapi.com", {
    transports: ["websocket"],
    path: "/v3/",
  });

  client.emit("heartbeat", api_key);
  client.emit("real_time_join", currency_ids);
  setTimeout(function () {}, 1500);
  client.on("data_received", function (prices_data) {
    // console.log(prices_data); // see full response

    // get prices
    console.log(" -------------- NEW ------------ " + prices_data.s);
    var temp = {};
    temp["Id"] = prices_data.id;
    temp["Currency"] = prices_data.s; // Name, EUR/USD
    temp["Decimal"] = prices_data.dp; // No of decimal in currency
    temp["Ask"] = prices_data.a; // Ask price
    temp["Bid"] = prices_data.b;
    temp["Open"] = prices_data.lc; //Open price
    temp["High"] = prices_data.h;
    temp["Low"] = prices_data.l;
    temp["Close"] = prices_data.c; // current or close price
    temp["Spread"] = prices_data.sp;
    temp["Change"] = prices_data.ch;
    temp["Chg_per"] = prices_data.cp; // change percentage

    if (typeof prices_data.v === "undefined") temp["Volume"] = 0;
    else temp["Volume"] = prices_data.v;

    temp["Time"] = prices_data.t;

    console.log(temp);
    socket.emit("data", temp);
  });
  client.on("successfully", (message) => {
    console.log(message);
  });
  client.on("disconnect", (message) => {
    console.log(message);
  });
  client.on("connect_error", function (e) {
    // On error, socket will auto retry to connect, so we will wait 10 seconds before manully connect with backup

    console.log(
      "Connection error. If you see this message for more then 15 minutes then contact us. ",
      e
    );
  });
  client.emit("echo", "Hello World", function (message) {
    console.log("Echo received: ", message);
    client.disconnect();
    server.close();
  });
  socket.on("disconnect", async (e) => {
    console.log(e);
  });
};
