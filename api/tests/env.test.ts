import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";

const envModule = new URL("../src/config/env.ts", import.meta.url).href;

test("dotenv loads local values quietly without overriding externally supplied settings", () => {
  const temporaryRoot = realpathSync(tmpdir());
  const directory = mkdtempSync(join(temporaryRoot, "projectai-env-test-"));
  try {
    writeFileSync(
      join(directory, ".env"),
      'PORT=54321\nCLIENT_URL="http://fixture.example"\nJWT_SECRET=fixture-secret\n',
    );
    const childEnv: NodeJS.ProcessEnv = {
      ...process.env,
      DATABASE_URL: "postgresql://test:test@127.0.0.1:1/not_used",
      JWT_SECRET: "external-test-secret",
      PORT: "54322",
      NODE_ENV: "test",
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "",
      GEMINI_API_KEY: "",
      RAPID_API_KEY: "",
    };
    delete childEnv.CLIENT_URL;
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        import.meta.resolve("tsx"),
        "--input-type=module",
        "-e",
        `const { env } = await import(${JSON.stringify(envModule)}); console.log(JSON.stringify({ port: env.PORT, client: env.CLIENT_URL, externalSecret: env.JWT_SECRET === "external-test-secret", aiKey: env.OPENAI_API_KEY }));`,
      ],
      { cwd: directory, env: childEnv, encoding: "utf8", timeout: 15_000 },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), {
      port: 54322,
      client: "http://fixture.example",
      externalSecret: true,
      aiKey: "",
    });

    const invalid = spawnSync(
      process.execPath,
      [
        "--import",
        import.meta.resolve("tsx"),
        "--input-type=module",
        "-e",
        `await import(${JSON.stringify(envModule)});`,
      ],
      {
        cwd: directory,
        env: { ...childEnv, JWT_SECRET: "" },
        encoding: "utf8",
        timeout: 15_000,
      },
    );
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /JWT_SECRET/);
  } finally {
    assert.equal(dirname(realpathSync(directory)), temporaryRoot);
    rmSync(directory, { recursive: true, force: true });
  }
});
