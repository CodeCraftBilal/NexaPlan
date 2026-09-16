import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "./env.js";
import { verifySessionToken } from "../middleware/auth.js";
import { requireProjectAccess, requireWorkspaceAccess } from "../services/access.service.js";

export let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("token="));
      const token = cookie ? decodeURIComponent(cookie.slice(6)) : socket.handshake.auth.token;
      if (typeof token !== "string") throw new Error("Authentication required");
      socket.data.user = verifySessionToken(token);
      next();
    } catch {
      next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    socket.on("join_workspace", async (workspaceId: string) => {
      try {
        if (typeof workspaceId !== "string" || !workspaceId) return;
        await requireWorkspaceAccess(workspaceId, socket.data.user.id);
        await socket.join(`workspace_${workspaceId}`);
      } catch {
        socket.emit("access_error", { message: "Workspace access denied" });
      }
    });
    
    socket.on("join_project", async (projectId: string) => {
      try {
        if (typeof projectId !== "string" || !projectId) return;
        await requireProjectAccess(projectId, socket.data.user.id);
        await socket.join(`project_${projectId}`);
      } catch {
        socket.emit("access_error", { message: "Project access denied" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};
