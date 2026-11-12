import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres2@localhost:5432/class_album?schema=public";

const isProduction = process.env.NODE_ENV === "production";
const needsSsl =
  connectionString.includes("sslmode=require") ||
  connectionString.includes("render.com") ||
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co") ||
  process.env.PGSSLMODE === "require";

const pool = new Pool({
  connectionString,
  max: isProduction ? 2 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
