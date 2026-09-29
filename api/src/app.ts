import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createAuthRouter, type AuthRepository } from "./routes/auth.js";
import workspaceRoutes from "./routes/workspaces.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";

export function createApp(
  options: { authRepository?: AuthRepository } = {},
): Application {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 1000,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests. Please try again shortly.",
      },
    }),
  );
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many sign-in attempts. Please try again in 15 minutes.",
    },
  });
  app.use(["/api/auth/login", "/api/auth/register"], authLimiter);
  // Match only the API root so nested routes reach their handlers.
  app.get("/api", (_req, res) => {
    res.json({ success: true, message: "AI Project Manager API is running" });
  });
  app.use("/api/auth", createAuthRouter(options.authRepository));
  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/ai", aiRoutes);
  app.get("/", (_req, res) => {
    res.json({ message: "AI Project Manager API is running", status: "ok" });
  });
  app.get("/health", (_req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Endpoint not found" });
  });
  app.use(errorHandler);
  return app;
}
