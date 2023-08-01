// // var FCM = require("fcm-node");
// import { config } from 'dotenv'

// config()
// import FCM from "fcm-node";
// var serverKey =
// process.env.FIREBASE_SERVER_KEY; //put your server key here

// var fcm = new FCM(serverKey);

// const push_notifications = (notification_obj, setresponse) => {
//   var message = {
//     to: notification_obj.deviceToken,
//     collapse_key: "your_collapse_key",

//     notification: {
//       title: notification_obj.title,
//       body: notification_obj.body,
//     },
//   };

//   fcm.send(message, function (err, response) {
//     if (err) {
//       console.log("err", err);
//     } else {
//       console.log("response", response);
//     }
//   });
// };

// // module.exports = { push_notifications };
// export default push_notifications;
