import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/shared/db";

/** Auth.js adapter backed by the shared Prisma 7 client. */
export function createAuthAdapter() {
  return PrismaAdapter(prisma);
}
