import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

export let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("join_workspace", (workspaceId: string) => {
      socket.join(`workspace_${workspaceId}`);
    });
    
    socket.on("join_project", (projectId: string) => {
      socket.join(`project_${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
