import assert from "node:assert/strict";
import { after, before, beforeEach, mock, test } from "node:test";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthRepository } from "../src/routes/auth.js";

// Never connect to the developer's database or use their secrets in regression tests.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/not_used";
process.env.JWT_SECRET = "isolated-auth-regression-test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.GEMINI_API_KEY = "";
process.env.OPENAI_API_KEY = "";
delete process.env.AI_PROVIDER;

const { createApp } = await import("../src/app.js");
const { prisma } = await import("../src/config/database.js");
const databaseRestorers: Array<() => void> = [];
function mockDatabaseMethod(
  model: object,
  name: string,
  implementation: (...args: any[]) => any,
) {
  // Prisma delegates are proxies; Node's descriptor-based mock.method cannot patch them.
  const delegate = model as Record<string, unknown>;
  const original = delegate[name];
  const replacement = mock.fn(implementation);
  delegate[name] = replacement;
  databaseRestorers.push(() => {
    delegate[name] = original;
  });
  return replacement;
}
function restoreMocks() {
  for (const restore of databaseRestorers.splice(0).reverse()) restore();
  mock.restoreAll();
}
type TestUser = NonNullable<Awaited<ReturnType<AuthRepository["findByEmail"]>>>;
const users = new Map<string, TestUser>();
const repository: AuthRepository = {
  async findByEmail(email) {
    return (
      [...users.values()].find(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  },
  async findById(id) {
    return users.get(id) ?? null;
  },
  async create(data) {
    const user: TestUser = {
      ...data,
      id: "test-user",
      role: "USER",
      avatar: null,
    };
    users.set(user.id, user);
    return user;
  },
};
let server: Server;
let baseUrl: string;
const credentials = {
  name: "Test User",
  email: "test@example.com",
  password: "secret123",
};
const session = () =>
  `token=${jwt.sign({ id: "test-user", role: "USER" }, process.env.JWT_SECRET!)}`;

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, options);
}
async function post(path: string, body: unknown, cookie?: string) {
  return request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}
async function seedUser() {
  return repository.create({
    ...credentials,
    password: await bcrypt.hash(credentials.password, 4),
  });
}
function mockProjectAccess(
  workspaceRole: string | null,
  projectRole: string | null,
) {
  mockDatabaseMethod(prisma.project, "findUnique", async () => ({
    workspaceId: "workspace-1",
    members: projectRole ? [{ role: projectRole }] : [],
  }));
  mockDatabaseMethod(prisma.workspaceMember, "findUnique", async () =>
    workspaceRole ? { role: workspaceRole } : null,
  );
}

before(async () => {
  server = createServer(createApp({ authRepository: repository }));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
beforeEach(() => {
  users.clear();
  restoreMocks();
});
after(async () => {
  restoreMocks();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  await prisma.$disconnect();
});

test("API root does not swallow auth, protected, missing, or wrong-method routes", async () => {
  assert.equal((await request("/api")).status, 200);
  assert.equal((await request("/api/auth/me")).status, 401);
  assert.equal((await request("/api/workspaces")).status, 401);
  assert.equal((await request("/api/tasks/mine")).status, 401);
  assert.equal((await request("/api/does-not-exist")).status, 404);
  assert.equal((await post("/api", {})).status, 404);
});

test("registration creates a cookie session, restores it, and logout clears it", async () => {
  const registered = await post("/api/auth/register", {
    ...credentials,
    name: "  Test User  ",
    email: "  TEST@Example.com  ",
  });
  assert.equal(registered.status, 201);
  const body = await registered.json();
  assert.equal(body.user.name, "Test User");
  assert.equal(body.user.email, "test@example.com");
  assert.equal("password" in body.user, false);
  const stored = users.get(body.user.id)!;
  assert.notEqual(stored.password, credentials.password);
  assert.equal(
    await bcrypt.compare(credentials.password, stored.password),
    true,
  );
  const cookie = registered.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Path=\//i);
  assert.match(cookie, /Max-Age=604800/i);
  assert.equal(registered.headers.get("cache-control"), "no-store");
  const me = await request("/api/auth/me", {
    headers: { cookie: cookie.split(";")[0]! },
  });
  assert.equal(me.status, 200);
  assert.deepEqual((await me.json()).user, body.user);
  const logout = await post("/api/auth/logout", {}, cookie.split(";")[0]);
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie")!, /^token=;/);
  assert.match(logout.headers.get("set-cookie")!, /Expires=Thu, 01 Jan 1970/i);
  assert.equal((await request("/api/auth/me")).status, 401);
});

test("login normalizes email, accepts existing accounts, and never returns password hashes", async () => {
  await seedUser();
  const response = await post("/api/auth/login", {
    email: " TEST@EXAMPLE.COM ",
    password: credentials.password,
  });
  assert.equal(response.status, 200);
  assert.ok(response.headers.get("set-cookie"));
  assert.equal("password" in (await response.json()).user, false);
});

test("validation errors include a useful message and Zod 4 field issues", async () => {
  const response = await post("/api/auth/register", {
    name: " ",
    email: "invalid",
    password: "x",
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(typeof body.message, "string");
  assert.ok(
    body.errors.some((error: { path: string[] }) => error.path[0] === "email"),
  );
  assert.equal(users.size, 0);
  const longPassword = await post("/api/auth/register", {
    ...credentials,
    password: "🔒".repeat(19),
  });
  assert.equal(longPassword.status, 400);
});

test("unknown accounts and wrong passwords produce the same authentication error", async () => {
  await seedUser();
  const wrongPassword = await post("/api/auth/login", {
    ...credentials,
    password: "incorrect",
  });
  const unknown = await post("/api/auth/login", {
    ...credentials,
    email: "unknown@example.com",
  });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknown.status, 401);
  assert.deepEqual(await wrongPassword.json(), await unknown.json());
  assert.equal(wrongPassword.headers.get("set-cookie"), null);
});

test("duplicate and concurrent registration return a useful conflict response", async () => {
  await seedUser();
  assert.equal((await post("/api/auth/register", credentials)).status, 409);
  users.clear();
  mock.method(repository, "create", async () => {
    throw { code: "P2002" };
  });
  const race = await post("/api/auth/register", credentials);
  assert.equal(race.status, 409);
  assert.match((await race.json()).message, /already registered/i);
});

test("invalid, expired, and malformed signed sessions are rejected and cleared", async () => {
  const tokens = [
    "not-a-token",
    jwt.sign({ id: "test-user", role: "USER" }, process.env.JWT_SECRET!, {
      expiresIn: -1,
    }),
    jwt.sign({ role: "USER" }, process.env.JWT_SECRET!),
    jwt.sign({ id: "test-user", role: "SUPERADMIN" }, process.env.JWT_SECRET!),
    jwt.sign({ id: "test-user", role: "USER" }, process.env.JWT_SECRET!, {
      algorithm: "HS384",
    }),
  ];
  for (const token of tokens) {
    const response = await request("/api/auth/me", {
      headers: { cookie: `token=${token}` },
    });
    assert.equal(response.status, 401);
    assert.match(response.headers.get("set-cookie")!, /^token=;/);
  }
});

test("valid bearer sessions work and deleted accounts clear stale sessions with 401", async () => {
  await seedUser();
  const token = session().slice(6);
  const me = await request("/api/auth/me", {
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(me.status, 200);
  users.clear();
  const deleted = await request("/api/auth/me", {
    headers: { cookie: session() },
  });
  assert.equal(deleted.status, 401);
  assert.match(deleted.headers.get("set-cookie")!, /^token=;/);
});

test("malformed JSON returns a client error", async () => {
  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /JSON/);
});

test("missing AI configuration does not prevent auth or API startup", async () => {
  const response = await post(
    "/api/ai/project-plan",
    { description: "A test project" },
    session(),
  );
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /not configured/i);
});

test("project creation rejects people outside the workspace and viewers", async () => {
  for (const role of [null, "VIEWER"]) {
    restoreMocks();
    mockDatabaseMethod(prisma.workspaceMember, "findUnique", async () =>
      role ? { role } : null,
    );
    const create = mockDatabaseMethod(prisma.project, "create", async () => {
      throw new Error("Must not write");
    });
    const response = await post(
      "/api/projects",
      { name: "New project", workspaceId: "workspace-1" },
      session(),
    );
    assert.equal(response.status, 403);
    assert.equal(create.mock.callCount(), 0);
  }
});

test("task reads require both workspace access and project access", async () => {
  for (const [workspaceRole, projectRole] of [
    ["MEMBER", null],
    [null, "MEMBER"],
  ]) {
    restoreMocks();
    mockProjectAccess(workspaceRole!, projectRole!);
    const read = mockDatabaseMethod(prisma.task, "findMany", async () => {
      throw new Error("Must not read");
    });
    const response = await request("/api/tasks/project/project-1", {
      headers: { cookie: session() },
    });
    assert.equal(response.status, 403);
    assert.equal(read.mock.callCount(), 0);
  }
});

test("project viewers cannot change task status", async () => {
  mockProjectAccess("MEMBER", "VIEWER");
  mockDatabaseMethod(prisma.task, "findUnique", async () => ({
    projectId: "project-1",
  }));
  const update = mockDatabaseMethod(prisma.task, "update", async () => {
    throw new Error("Must not write");
  });
  const response = await request("/api/tasks/task-1/status", {
    method: "PATCH",
    headers: { cookie: session(), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "COMPLETED" }),
  });
  assert.equal(response.status, 403);
  assert.equal(update.mock.callCount(), 0);
});

test("workspace managers can read project tasks and project members can update them", async () => {
  mockProjectAccess("OWNER", null);
  mockDatabaseMethod(prisma.task, "findMany", async () => [
    { id: "task-1", title: "Test task" },
  ]);
  const list = await request("/api/tasks/project/project-1", {
    headers: { cookie: session() },
  });
  assert.equal(list.status, 200);
  assert.equal((await list.json()).data[0].id, "task-1");
  restoreMocks();
  mockProjectAccess("MEMBER", "MEMBER");
  mockDatabaseMethod(prisma.task, "findUnique", async () => ({
    projectId: "project-1",
  }));
  mockDatabaseMethod(
    prisma.task,
    "update",
    async (args: { data: { status: string } }) => ({
      id: "task-1",
      projectId: "project-1",
      status: args.data.status,
    }),
  );
  const update = await request("/api/tasks/task-1/status", {
    method: "PATCH",
    headers: { cookie: session(), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "COMPLETED" }),
  });
  assert.equal(update.status, 200);
  assert.equal((await update.json()).data.status, "COMPLETED");
});

test("my tasks query is scoped to the signed-in user and accessible projects", async () => {
  const list = mockDatabaseMethod(prisma.task, "findMany", async () => []);
  const response = await request("/api/tasks/mine", {
    headers: { cookie: session() },
  });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, []);
  const query = list.mock.calls[0]!.arguments[0] as {
    where: { OR: unknown[]; project: { workspace: unknown; OR: unknown[] } };
  };
  assert.deepEqual(query.where.OR, [
    { assigneeId: "test-user" },
    { creatorId: "test-user", assigneeId: null },
  ]);
  assert.deepEqual(query.where.project.workspace, {
    members: { some: { userId: "test-user" } },
  });
  assert.equal(query.where.project.OR.length, 2);
});

test("invalid task status is rejected before any database mutation", async () => {
  const update = mockDatabaseMethod(prisma.task, "update", async () => {
    throw new Error("Must not write");
  });
  const response = await request("/api/tasks/task-1/status", {
    method: "PATCH",
    headers: { cookie: session(), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "NOT_A_STATUS" }),
  });
  assert.equal(response.status, 400);
  assert.equal(update.mock.callCount(), 0);
});

function mockContributorTransaction(
  options: {
    workspaceRole?: string | null;
    duplicate?: boolean;
    missing?: boolean;
  } = {},
) {
  const added = mock.fn(
    async (args: {
      data: { projectId: string; userId: string; role: string };
    }) => ({
      id: "member-2",
      ...args.data,
      user: { id: "target-user", name: "Teammate", email: "team@example.com" },
    }),
  );
  const workspaceAdded = mock.fn(async () => ({ role: "MEMBER" }));
  const lookup = mock.fn(async () =>
    options.missing ? null : { id: "target-user" },
  );
  const tx = {
    user: { findFirst: lookup },
    projectMember: {
      findUnique: async () => (options.duplicate ? { id: "existing" } : null),
      create: added,
    },
    workspaceMember: {
      findUnique: async () =>
        options.workspaceRole ? { role: options.workspaceRole } : null,
      upsert: workspaceAdded,
    },
  };
  mockDatabaseMethod(
    prisma,
    "$transaction",
    async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
  );
  return { added, workspaceAdded, lookup };
}

test("contributor endpoint requires authentication and valid input", async () => {
  assert.equal(
    (await post("/api/projects/project-1/contributors", {})).status,
    401,
  );
  assert.equal(
    (
      await post(
        "/api/projects/project-1/contributors",
        { email: "invalid" },
        session(),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await post(
        "/api/projects/project-1/contributors",
        { email: "team@example.com", role: "OWNER" },
        session(),
      )
    ).status,
    400,
  );
});

test("contributors cannot grant project access and workspace viewers cannot use manager role", async () => {
  for (const [workspace, project] of [
    ["MEMBER", "MEMBER"],
    ["MEMBER", "VIEWER"],
    ["VIEWER", "MANAGER"],
    ["MEMBER", null],
  ]) {
    restoreMocks();
    mockProjectAccess(workspace!, project!);
    const transaction = mockDatabaseMethod(prisma, "$transaction", async () => {
      throw new Error("Must not write");
    });
    const response = await post(
      "/api/projects/project-1/contributors",
      { email: "team@example.com" },
      session(),
    );
    assert.equal(response.status, 403);
    assert.equal(transaction.mock.callCount(), 0);
  }
});

test("workspace owner adds a contributor and prerequisite membership without granting workspace management", async () => {
  mockProjectAccess("OWNER", "MANAGER");
  const { added, workspaceAdded, lookup } = mockContributorTransaction();
  const response = await post(
    "/api/projects/project-1/contributors",
    { email: " TEAM@Example.com ", role: "MANAGER" },
    session(),
  );
  assert.equal(response.status, 201);
  assert.equal((await response.json()).data.role, "MANAGER");
  assert.equal(added.mock.callCount(), 1);
  assert.equal(workspaceAdded.mock.callCount(), 1);
  assert.equal(
    (
      lookup.mock.calls[0]!.arguments as unknown as [
        { where: { email: { equals: string } } },
      ]
    )[0].where.email.equals,
    "team@example.com",
  );
  const membership = (
    workspaceAdded.mock.calls[0]!.arguments as unknown as [
      { create: { role: string }; update: object },
    ]
  )[0];
  assert.equal(membership.create.role, "MEMBER");
  assert.deepEqual(membership.update, {});
});

test("project managers can add workspace members but cannot expand workspace membership", async () => {
  mockProjectAccess("MEMBER", "MANAGER");
  let tx = mockContributorTransaction({ workspaceRole: "MEMBER" });
  assert.equal(
    (
      await post(
        "/api/projects/project-1/contributors",
        { email: "team@example.com" },
        session(),
      )
    ).status,
    201,
  );
  assert.equal(tx.workspaceAdded.mock.callCount(), 0);
  restoreMocks();
  mockProjectAccess("MEMBER", "MANAGER");
  tx = mockContributorTransaction();
  assert.equal(
    (
      await post(
        "/api/projects/project-1/contributors",
        { email: "team@example.com" },
        session(),
      )
    ).status,
    403,
  );
  assert.equal(tx.added.mock.callCount(), 0);
  assert.equal(tx.workspaceAdded.mock.callCount(), 0);
});

test("adding contributors handles unknown accounts, duplicates, and workspace viewer restrictions", async () => {
  for (const [options, expected] of [
    [{ missing: true }, 404],
    [{ duplicate: true }, 409],
    [{ workspaceRole: "VIEWER" }, 400],
  ] as const) {
    restoreMocks();
    mockProjectAccess("OWNER", "MANAGER");
    const tx = mockContributorTransaction(options);
    assert.equal(
      (
        await post(
          "/api/projects/project-1/contributors",
          { email: "team@example.com" },
          session(),
        )
      ).status,
      expected,
    );
    assert.equal(tx.added.mock.callCount(), 0);
    assert.equal(tx.workspaceAdded.mock.callCount(), 0);
  }
  restoreMocks();
  mockProjectAccess("OWNER", "MANAGER");
  mockContributorTransaction({ workspaceRole: "VIEWER" });
  assert.equal(
    (
      await post(
        "/api/projects/project-1/contributors",
        { email: "team@example.com", role: "VIEWER" },
        session(),
      )
    ).status,
    201,
  );
});
