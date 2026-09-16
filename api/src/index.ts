import { createServer } from "http";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";
import { createApp } from "./app.js";

const httpServer = createServer(createApp());
initSocket(httpServer);
httpServer.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
