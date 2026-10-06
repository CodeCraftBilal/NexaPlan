/** Keep Prisma's schema selection separate from the node-postgres URL. */
export function databaseOptions(databaseUrl: string) {
  const url = new URL(databaseUrl);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must use postgresql:// or postgres://");
  }
  const schema = url.searchParams.get("schema") ?? "public";
  if (!schema.trim()) throw new Error("DATABASE_URL schema must not be empty");
  url.searchParams.delete("schema");

  return {
    connection: {
      connectionString: url.toString(),
      max: 10,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 10_000,
    },
    adapter: { schema },
  };
}
