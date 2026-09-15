import express, { type Application, type Request, type Response } from "express";

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (_req: Request, res: Response): void => {
  res.json({ message: "AI Project Manager API is running 🚀", status: "ok" });
});

// Health check
app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});