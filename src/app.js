
import { createServer } from "http"; // for local server
import { app } from "./appsub.js";
const httpServer = createServer(app); // for local without https

const port = process.env.PORT || 9000;
httpServer.listen(port, async () => {
  console.log("Server listening on port " + port);
});
