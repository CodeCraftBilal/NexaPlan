import assert from "node:assert/strict";
import { test } from "node:test";
import { databaseOptions } from "../src/config/database-options.js";

test("database options preserve encoded credentials and driver options while selecting a schema", () => {
  const options = databaseOptions(
    "postgresql://user:p%40ss@localhost:5432/test?schema=team%20work&sslmode=verify-full&application_name=projectai",
  );
  const connection = new URL(options.connection.connectionString);
  assert.equal(connection.password, "p%40ss");
  assert.equal(connection.searchParams.has("schema"), false);
  assert.equal(connection.searchParams.get("sslmode"), "verify-full");
  assert.equal(connection.searchParams.get("application_name"), "projectai");
  assert.equal(options.adapter.schema, "team work");
  assert.ok(options.connection.connectionTimeoutMillis > 0);
});

test("database options default to public and reject unsupported database URLs", () => {
  assert.equal(
    databaseOptions("postgres://user:pass@localhost/test").adapter.schema,
    "public",
  );
  assert.throws(
    () => databaseOptions("https://localhost/test"),
    /must use postgresql/,
  );
  assert.throws(
    () => databaseOptions("postgresql://localhost/test?schema="),
    /schema must not be empty/,
  );
});
