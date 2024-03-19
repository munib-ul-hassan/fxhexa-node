
import { createServer } from "http"; // for local server
import { app } from "./appsub.js";
import { Server } from "socket.io";

import { socketEventListner } from "./socketEventListener.js";
const httpServer = createServer(app); // for local without https
export const io = new Server(httpServer); // for local

io.addListener("connection", socketEventListner);


const port = process.env.PORT || 9000;
httpServer.listen(port, async () => {
  console.log("Server listening on port " + port);
});
