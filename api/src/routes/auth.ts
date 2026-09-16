import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";
import { registerSchema, loginSchema } from "../utils/validation.js";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { sessionCookieOptions, sessionLifetimeMs } from "../config/session.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { HttpError } from "../utils/httpError.js";

type SessionUser = Pick<User, "id" | "name" | "email" | "role" | "avatar">;
type CredentialUser = SessionUser & Pick<User, "password">;
export interface AuthRepository {
  findByEmail(email: string): Promise<CredentialUser | null>;
  findById(id: string): Promise<SessionUser | null>;
  create(data: { name: string; email: string; password: string }): Promise<CredentialUser>;
}
const userFields = { id: true, name: true, email: true, role: true, avatar: true } as const;
const authRepository: AuthRepository = {
  // Case-insensitive lookup also supports accounts registered before normalization.
  findByEmail: (email) => prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }),
  findById: (id) => prisma.user.findUnique({ where: { id }, select: userFields }),
  create: (data) => prisma.user.create({ data }),
};
const publicUser = (user: CredentialUser | SessionUser): SessionUser => ({
  id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar,
});

export function createAuthRouter(repository: AuthRepository = authRepository) {
  const router = Router();
  router.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  router.post("/register", async (req, res, next) => {
    try {
      const data = registerSchema.parse(req.body);
      if (await repository.findByEmail(data.email)) {
        throw new HttpError(409, "Email already registered. Please sign in.");
      }
      const password = await bcrypt.hash(data.password, 10);
      const user = await repository.create({ ...data, password });
      const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { ...sessionCookieOptions, maxAge: sessionLifetimeMs });
      res.status(201).json({ success: true, user: publicUser(user) });
    } catch (error) {
      // A simultaneous registration can pass the initial lookup before the unique constraint.
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        next(new HttpError(409, "Email already registered. Please sign in."));
        return;
      }
      next(error);
    }
  });
  router.post("/login", async (req, res, next) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await repository.findByEmail(data.email);
      if (!user || !(await bcrypt.compare(data.password, user.password))) {
        throw new HttpError(401, "Invalid email or password");
      }
      const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { ...sessionCookieOptions, maxAge: sessionLifetimeMs });
      res.json({ success: true, user: publicUser(user) });
    } catch (error) { next(error); }
  });
  router.post("/logout", (_req, res) => {
    res.clearCookie("token", sessionCookieOptions);
    res.json({ success: true, message: "Logged out successfully" });
  });
  router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
    try {
      const user = await repository.findById(req.user!.id);
      if (!user) {
        res.clearCookie("token", sessionCookieOptions);
        throw new HttpError(401, "Your account is no longer available. Please sign in again.");
      }
      res.json({ success: true, user: publicUser(user) });
    } catch (error) { next(error); }
  });
  return router;
}
