import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().trim().optional(),
  OPENAI_API_KEY: z.string().trim().optional(),
  AI_PROVIDER: z.enum(["openai", "gemini"]).optional(),
  OPENAI_MODEL: z.string().trim().min(1).default("gpt-4.1-mini"),
  GEMINI_MODEL: z.string().trim().min(1).default("gemini-2.5-flash"),
  CLIENT_URL: z.string().url(),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
