import { PrismaPg } from "@prisma/adapter-pg";
import { getEnv } from "@/shared/config";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = getEnv().DATABASE_URL;
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** The single Prisma client. Only feature repositories may import it. */
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
