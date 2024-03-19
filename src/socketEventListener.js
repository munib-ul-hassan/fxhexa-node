import { io } from "./app.js";
import ios from "socket.io-client";

var api_key = process.env.FSC_API_KEY;
var currency_ids = "15,101,38,112,56,50,134";

export const socketEventListner = (socket) => {
  function connectwithfscserver() {
    var ws_url = "wss://fcsapi.com"; // web socket URL
    let newSocket = ios.connect(ws_url, {
      transports: ["websocket"],
      path: "/v3/",
    });
    newSocket.emit("heartbeat", api_key);
    console.log(api_key);
    newSocket.emit("real_time_join", currency_ids);
    newSocket.on("data_received", function (prices_data) {
      // get prices
      console.log(prices_data);
      socket.emit("data",prices_data)
    });
    newSocket.on("disconnect", (message) => {
      console.log(message);

      // when you'r disconnect,  auto re-connection after 15 minute
    });
    newSocket.on("connect_error", function () {
      // On error, socket will auto retry to connect, so we will wait 10 seconds before manully connect with backup

      console.log(
        "Connection error. If you see this message for more then 15 minutes then contact us. "
      );
    });
  }
  setTimeout(function () {
    connectwithfscserver();
  }, 1500);

  socket.on("disconnect", async () => {});
};
