import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import axios from "axios";
import { NextRequest } from "next/server.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Execute the real TypeScript modules with an isolated cache per test. This
// keeps the tests dependency-free while giving each test a fresh session store.
function loadModules() {
  const modules = new Map();
  function load(relative) {
    const filename = path.resolve(
      root,
      relative.endsWith(".ts") ? relative : `${relative}.ts`,
    );
    if (modules.has(filename)) return modules.get(filename).exports;
    const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText;
    const loadedModule = { exports: {} };
    modules.set(filename, loadedModule);
    const localRequire = (name) =>
      name.startsWith("@/") ? load(name.slice(2)) : require(name);
    new vm.Script(`(function(require, module, exports) { ${output}\n})`, {
      filename,
    }).runInThisContext()(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return load;
}

function setup() {
  const load = loadModules();
  const { useAuthStore: store } = load("stores/authStore");
  const { api } = load("lib/api");
  const { initializeAuth } = load("lib/auth-session");
  return { load, store, api, initializeAuth };
}

const user = {
  id: "user-1",
  name: "Alex Morgan",
  email: "alex@example.com",
  role: "USER",
};
const reply = (config, data) => ({
  config,
  data,
  status: 200,
  statusText: "OK",
  headers: {},
});
function unauthorized(config, status = 401) {
  const { AxiosError } = axios;
  return new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
    config,
    status,
    statusText: "Unauthorized",
    headers: {},
    data: { success: false },
  });
}
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("Strict Mode initialization shares one request and hydrates the user", async () => {
  const { store, api, initializeAuth } = setup();
  let calls = 0;
  api.defaults.adapter = async (config) => {
    calls += 1;
    return reply(config, { success: true, user });
  };
  const first = initializeAuth();
  assert.equal(initializeAuth(), first);
  await first;
  assert.equal(calls, 1);
  assert.equal(store.getState().isAuthenticated, true);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().isInitialized, true);
  assert.deepEqual(store.getState().user, user);
});

test("late session failure cannot overwrite a successful login", async () => {
  const { store, api, initializeAuth } = setup();
  const response = deferred();
  api.defaults.adapter = async (config) => {
    await response.promise;
    throw unauthorized(config);
  };
  const check = initializeAuth();
  store.getState().setUser(user);
  response.resolve();
  await check;
  assert.equal(store.getState().isAuthenticated, true);
  assert.deepEqual(store.getState().user, user);
  assert.equal(store.getState().sessionError, null);
});

test("late session success cannot restore a logged-out user", async () => {
  const { store, api, initializeAuth } = setup();
  const response = deferred();
  api.defaults.adapter = async (config) => {
    await response.promise;
    return reply(config, { success: true, user });
  };
  const check = initializeAuth();
  store.getState().logout();
  response.resolve();
  await check;
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().user, null);
  assert.equal(store.getState().isLoading, false);
});

test("invalid or expired cookies settle as signed out, without an outage error", async () => {
  const { store, api, initializeAuth } = setup();
  api.defaults.adapter = async (config) => {
    throw unauthorized(config);
  };
  await initializeAuth();
  assert.equal(store.getState().isInitialized, true);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().sessionError, null);
});

test("a server outage is retryable and does not masquerade as logout", async () => {
  const { store, api, initializeAuth } = setup();
  store.getState().setUser(user);
  api.defaults.adapter = async (config) => {
    throw unauthorized(config, 503);
  };
  await initializeAuth();
  assert.ok(store.getState().sessionError);
  assert.equal(store.getState().isLoading, false);
  assert.equal(store.getState().isAuthenticated, true);
  api.defaults.adapter = async (config) =>
    reply(config, { success: true, user });
  await initializeAuth();
  assert.equal(store.getState().sessionError, null);
  assert.equal(store.getState().isAuthenticated, true);
});

test("a malformed session payload never authenticates", async () => {
  const { store, api, initializeAuth } = setup();
  api.defaults.adapter = async (config) =>
    reply(config, { success: true, user: { id: "missing-fields" } });
  await initializeAuth();
  assert.equal(store.getState().isAuthenticated, false);
  assert.ok(store.getState().sessionError);
});

test("protected API 401 expires the current session", async () => {
  const { store, api } = setup();
  store.getState().setUser(user);
  api.defaults.adapter = async (config) => {
    throw unauthorized(config);
  };
  await assert.rejects(api.get("/projects"));
  assert.equal(store.getState().isAuthenticated, false);
  assert.equal(store.getState().user, null);
});

test("a failed login does not expire another established session", async () => {
  const { store, api } = setup();
  store.getState().setUser(user);
  api.defaults.adapter = async (config) => {
    throw unauthorized(config);
  };
  await assert.rejects(api.post("/auth/login", {}));
  assert.equal(store.getState().isAuthenticated, true);
});

test("a previous session's delayed protected 401 cannot expire a new login", async () => {
  const { store, api } = setup();
  const started = deferred();
  const response = deferred();
  store.getState().setUser(user);
  api.defaults.adapter = async (config) => {
    started.resolve();
    await response.promise;
    throw unauthorized(config);
  };
  const request = api.get("/projects");
  await started.promise;
  const nextUser = { ...user, id: "user-2" };
  store.getState().setUser(nextUser);
  response.resolve();
  await assert.rejects(request);
  assert.deepEqual(store.getState().user, nextUser);
});

test("return URLs keep protected deep links and reject external or auth loops", () => {
  const { safeReturnTo } = loadModules()("lib/auth-navigation");
  assert.equal(
    safeReturnTo("/projects/p-1?tab=board#tasks"),
    "/projects/p-1?tab=board#tasks",
  );
  assert.equal(safeReturnTo("/my-tasks?status=TODO"), "/my-tasks?status=TODO");
  for (const value of [
    null,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/%5cevil.example",
    "/login",
    "/register?next=/login",
    "/projects-other",
    "/projects/../login",
    "/api/auth/logout",
  ]) {
    assert.equal(safeReturnTo(value), "/dashboard", String(value));
  }
});

test("protected route matching uses path boundaries", () => {
  const { isProtectedPath } = loadModules()("lib/auth-navigation");
  for (const value of [
    "/dashboard",
    "/my-tasks",
    "/projects/123",
    "/notifications",
    "/settings",
  ])
    assert.equal(isProtectedPath(value), true);
  for (const value of ["/", "/login", "/projects-demo", "/dashboard-public"])
    assert.equal(isProtectedPath(value), false);
});

test("proxy preserves the intended route and allows stale-cookie sign-in", () => {
  const { proxy } = loadModules()("proxy");
  const missing = proxy(
    new NextRequest("http://localhost:3000/my-tasks?status=TODO"),
  );
  const location = new URL(missing.headers.get("location"));
  assert.equal(location.pathname, "/login");
  assert.equal(location.searchParams.get("next"), "/my-tasks?status=TODO");
  const stale = proxy(
    new NextRequest("http://localhost:3000/login", {
      headers: { Cookie: "token=expired" },
    }),
  );
  assert.equal(stale.headers.get("location"), null);
});
