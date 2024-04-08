
import { createServer } from "http"; // for local server
import { app } from "./appsub.js";
import ios from 'socket.io';

const { Server, Socket } = ios;
// import * as socketIo from 'socket.io' 
import { socketEventListner } from "./socketEventListener.js";
// import { socket_connection } from "./server.js";
// import {Server, Socket} from 'socket.io'; 
// const io = new Server(server);
const httpServer = createServer(app); // for local without https
// export const io = new Server(httpServer); // for local
// io = socketIo(httpServer)

// io.on("connection", (s)=>{
// s.emit("data","============")
// });
// socket_connection()

const port = process.env.PORT || 9000;
httpServer.listen(port, async () => {
  console.log("Server listening on port " + port);
});
