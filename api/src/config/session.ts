import type { CookieOptions } from "express";
import { env } from "./env.js";

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
