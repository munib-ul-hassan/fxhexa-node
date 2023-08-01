const API_KEY = "epXMii7SipI4yVqqpeimenbXZLgTlPk_";
import {  restClient } from "polygon.io";

const rest = restClient(API_KEY);

export const getForexData = (startDate,endDate) => {
return rest.stocks
    .aggregates("AAPL", 1, "day", startDate,endDate)
    .then((data) => {
    //   console.log(data);
      return data
    })
    .catch((e) => {
        return e.message
      console.error("An error happened:", e);
    });
};
