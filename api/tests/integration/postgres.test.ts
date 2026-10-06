import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { databaseOptions } from "../../src/config/database-options.js";
import { pollingClient } from "./polling-client.js";
import { z } from "zod";

// Deliberately separate from DATABASE_URL: never use the developer's .env.
const suppliedUrl = process.env.TEST_DATABASE_URL;
if (!suppliedUrl)
  throw new Error(
    "Set TEST_DATABASE_URL to a disposable local PostgreSQL database ending in _test",
  );
const url = new URL(suppliedUrl);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
  !url.pathname.endsWith("_test")
) {
  throw new Error(
    "Integration tests require a local database with a name ending in _test",
  );
}
const schema = `upgrade_${randomUUID().replaceAll("-", "")}`;
url.searchParams.set("schema", schema);
process.env.DATABASE_URL = url.toString();
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "isolated-integration-test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.AI_PROVIDER = "openai";
process.env.OPENAI_API_KEY = "";
process.env.GEMINI_API_KEY = "";
process.env.RAPID_API_KEY = "";

const { createApp } = await import("../../src/app.js");
const { prisma } = await import("../../src/config/database.js");
const { initSocket } = await import("../../src/config/socket.js");
const { WorkspaceService } =
  await import("../../src/services/workspace.service.js");
const { ProjectService } =
  await import("../../src/services/project.service.js");
const { TaskService } = await import("../../src/services/task.service.js");

test(
  "Prisma 7 preserves migration structure, HTTP auth, membership transactions, and task persistence",
  { timeout: 90_000 },
  async (t) => {
    const options = databaseOptions(suppliedUrl);
    const control = new PrismaClient({
      adapter: new PrismaPg(options.connection, options.adapter),
    });
    let created = false;
    const server = createServer(createApp());
    const io = initSocket(server);
    t.after(async () => {
      await new Promise<void>((resolve) => io.close(() => resolve()));
      await prisma.$disconnect();
      try {
        // Only drop this test's successfully created, randomly named schema.
        if (created && /^upgrade_[a-f0-9]{32}$/.test(schema)) {
          await control.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
        }
      } finally {
        await control.$disconnect();
      }
    });
    await control.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
    created = true;
    const cli = fileURLToPath(
      new URL("../../node_modules/prisma/build/index.js", import.meta.url),
    );
    const cwd = fileURLToPath(new URL("../../", import.meta.url));
    execFileSync(process.execPath, [cli, "migrate", "deploy"], {
      cwd,
      env: process.env,
      stdio: "pipe",
      timeout: 30_000,
    });
    execFileSync(
      process.execPath,
      [
        cli,
        "migrate",
        "diff",
        "--from-config-datasource",
        "--to-schema",
        "prisma/schema.prisma",
        "--exit-code",
      ],
      { cwd, env: process.env, stdio: "pipe", timeout: 30_000 },
    );

    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const base = `http://127.0.0.1:${address.port}`;
    const register = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Upgrade Owner",
        email: "OWNER@example.com",
        password: "test-password",
      }),
    });
    assert.equal(register.status, 201);
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: "owner@example.com" },
    });
    assert.notEqual(owner.password, "test-password");
    const login = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "OWNER@example.com",
        password: "test-password",
      }),
    });
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie") ?? "", /HttpOnly/);
    await assert.rejects(
      prisma.user.create({
        data: { email: owner.email, name: "Duplicate", password: "unused" },
      }),
      { code: "P2002" },
    );

    const workspace = await WorkspaceService.createWorkspace(
      "Upgrade workspace",
      null,
      owner.id,
    );
    assert.equal(
      (
        await prisma.workspaceMember.findUniqueOrThrow({
          where: {
            workspaceId_userId: { workspaceId: workspace.id, userId: owner.id },
          },
        })
      ).role,
      "OWNER",
    );
    const project = await ProjectService.createProject({
      name: "Upgrade project",
      description: null,
      workspaceId: workspace.id,
      ownerId: owner.id,
    });
    assert.equal(
      (
        await prisma.projectMember.findUniqueOrThrow({
          where: {
            projectId_userId: { projectId: project.id, userId: owner.id },
          },
        })
      ).role,
      "MANAGER",
    );
    const member = await prisma.user.create({
      data: { email: "member@example.com", name: "Member", password: "unused" },
    });
    await ProjectService.addContributor(project.id, owner.id, {
      email: "MEMBER@example.com",
      role: "MEMBER",
    });
    await assert.rejects(
      ProjectService.addContributor(project.id, owner.id, {
        email: member.email,
        role: "MEMBER",
      }),
      { statusCode: 409 },
    );
    assert.ok(
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: workspace.id, userId: member.id },
        },
      }),
    );

    const rollbackUser = await prisma.user.create({
      data: {
        email: "rollback@example.com",
        name: "Rollback",
        password: "unused",
      },
    });
    await assert.rejects(
      prisma.$transaction(async (tx) => {
        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: rollbackUser.id,
            role: "MEMBER",
          },
        });
        // Force the real compound uniqueness constraint after a successful write.
        await tx.projectMember.create({
          data: { projectId: project.id, userId: member.id, role: "MEMBER" },
        });
      }),
      { code: "P2002" },
    );
    assert.equal(
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: workspace.id,
            userId: rollbackUser.id,
          },
        },
      }),
      null,
    );

    const task = await TaskService.createTask({
      title: "Verify database",
      projectId: project.id,
      creatorId: owner.id,
      assigneeId: member.id,
      priority: "HIGH",
    });
    assert.equal(task.status, "TODO");
    assert.equal(task.description, null);
    assert.deepEqual(task.tags, []);
    const dueDate = new Date("2026-10-10T12:34:56.789Z");
    await prisma.task.update({
      where: { id: task.id },
      data: { dueDate, tags: ["upgrade", "regression"] },
    });
    assert.equal(
      (await TaskService.updateTaskStatus(task.id, "IN_REVIEW", member.id))
        .status,
      "IN_REVIEW",
    );
    const mine = await TaskService.getMyTasks(member.id);
    assert.equal(mine.length, 1);
    assert.equal(mine[0]?.dueDate?.toISOString(), dueDate.toISOString());
    assert.deepEqual(mine[0]?.tags, ["upgrade", "regression"]);
    await assert.rejects(
      TaskService.getProjectTasks(project.id, rollbackUser.id),
      { statusCode: 403 },
    );
    assert.equal(
      (await TaskService.getProjectTasks(project.id, member.id))[0]?.assignee
        ?.id,
      member.id,
    );

    const anonymous = await pollingClient(base);
    await anonymous.send("40");
    assert.match(await anonymous.read(), /44.*Authentication required/);
    await anonymous.send("1");

    const cookie = login.headers.get("set-cookie")?.split(";")[0];
    assert.ok(cookie);
    const socket = await pollingClient(base, cookie);
    await socket.send("40");
    assert.match(await socket.read(), /^40/);
    for (const [event, id, room] of [
      ["join_workspace", workspace.id, `workspace_${workspace.id}`],
      ["join_project", project.id, `project_${project.id}`],
    ]) {
      const joined = once(io.of("/").adapter, "join-room", {
        signal: AbortSignal.timeout(5_000),
      });
      await socket.send(`42${JSON.stringify([event, id])}`);
      assert.equal((await joined)[0], room);
    }
    await socket.send('42["join_project","unavailable-project"]');
    assert.match(await socket.read(), /access_error.*Project access denied/);
    await socket.send('42["join_workspace","unavailable-workspace"]');
    assert.match(await socket.read(), /access_error.*Workspace access denied/);

    const creation = await fetch(`${base}/api/tasks`, {
      method: "POST",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Realtime task", projectId: project.id }),
    });
    assert.equal(creation.status, 201);
    const createdTask = z
      .object({ data: z.object({ id: z.string() }) })
      .parse(await creation.json()).data;
    const createdEvent = await socket.read();
    assert.ok(createdEvent.startsWith("42"));
    const createdPayload = z
      .tuple([z.literal("task:created"), z.object({ id: z.string() })])
      .parse(JSON.parse(createdEvent.slice(2)));
    assert.equal(createdPayload[1].id, createdTask.id);
    const update = await fetch(`${base}/api/tasks/${createdTask.id}/status`, {
      method: "PATCH",
      headers: { cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    assert.equal(update.status, 200);
    await update.text();
    const updatedEvent = await socket.read();
    assert.ok(updatedEvent.startsWith("42"));
    const updatedPayload = z
      .tuple([
        z.literal("task:updated"),
        z.object({ id: z.string(), status: z.string() }),
      ])
      .parse(JSON.parse(updatedEvent.slice(2)));
    assert.equal(updatedPayload[1].id, createdTask.id);
    assert.equal(updatedPayload[1].status, "COMPLETED");
    await socket.send("1");
  },
);
