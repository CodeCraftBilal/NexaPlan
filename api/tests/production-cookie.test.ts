import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import bcrypt from "bcryptjs";
import type { AuthRepository } from "../src/routes/auth.js";

process.env.NODE_ENV = "production";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/not_used";
process.env.JWT_SECRET = "isolated-production-cookie-test-secret";
process.env.CLIENT_URL = "https://example.com";
process.env.GEMINI_API_KEY = "";
process.env.OPENAI_API_KEY = "";
process.env.RAPID_API_KEY = "";
process.env.AI_PROVIDER = "openai";
const { createApp } = await import("../src/app.js");
const { prisma } = await import("../src/config/database.js");

test("production login and logout use matching Secure, HttpOnly, SameSite and path settings", async () => {
  const user = {
    id: "production-test",
    name: "Test",
    email: "test@example.com",
    password: await bcrypt.hash("secret123", 4),
    role: "USER" as const,
    avatar: null,
  };
  const repository: AuthRepository = {
    async findByEmail() {
      return user;
    },
    async findById() {
      return user;
    },
    async create() {
      return user;
    },
  };
  const server = createServer(createApp({ authRepository: repository }));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, password: "secret123" }),
    });
    assert.equal(login.status, 200);
    const logout = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
    });
    assert.equal(logout.status, 200);
    for (const response of [login, logout]) {
      const cookie = response.headers.get("set-cookie")!;
      assert.match(cookie, /; Secure/);
      assert.match(cookie, /; HttpOnly/);
      assert.match(cookie, /; SameSite=Lax/);
      assert.match(cookie, /; Path=\//);
    }
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await prisma.$disconnect();
  }
});
