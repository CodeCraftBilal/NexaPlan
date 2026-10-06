import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";
import { databaseOptions } from "./database-options.js";

declare global {
  var prisma: PrismaClient | undefined;
}

function createClient() {
  const options = databaseOptions(env.DATABASE_URL);
  return new PrismaClient({
    adapter: new PrismaPg(options.connection, options.adapter),
  });
}

export const prisma = global.prisma ?? createClient();

if (env.NODE_ENV !== "production") global.prisma = prisma;
