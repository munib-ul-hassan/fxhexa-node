import { createServer } from "http";
import { app } from "./appsub.js";
import { socketEventListner } from "./socketEventListener.js";
import  Server from 'socket.io'; 
const httpServer = createServer(app); // for local without https
export const io = new Server(httpServer); // for local
io.addListener("connection", socketEventListner);
const port = process.env.PORT || 9000;
httpServer.listen(port, async () => {
  console.log("Server listening on port " + port);
});
