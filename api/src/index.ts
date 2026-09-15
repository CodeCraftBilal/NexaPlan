import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspaces.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";

const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api", (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: "AI Project Manager API is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (_req: Request, res: Response): void => {
  res.json({ message: "AI Project Manager API is running 🚀", status: "ok" });
});

// Health check
app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

// Start server
httpServer.listen(env.PORT, () => {
  console.log(`✅ Server is running on http://localhost:${env.PORT}`);
});
