import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sessionCookieOptions } from "../config/session.js";

export interface AuthUser {
  id: string;
  role: string;
}
export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function verifySessionToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "string" ||
    !decoded.id ||
    (decoded.role !== "USER" && decoded.role !== "ADMIN")
  ) {
    throw new Error("Invalid session payload");
  }
  return { id: decoded.id, role: decoded.role };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const bearerToken =
    req.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];
  const token = req.cookies?.token || bearerToken;
  if (!token || typeof token !== "string") {
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return;
  }
  try {
    req.user = verifySessionToken(token);
    next();
  } catch {
    res.clearCookie("token", sessionCookieOptions);
    res.status(401).json({
      success: false,
      message: "Your session has expired. Please sign in again.",
    });
  }
};
