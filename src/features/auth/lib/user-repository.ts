import { prisma } from "@/shared/db";

export type StoredUser = {
  id: string;
  email: string | null;
  passwordHash: string | null;
};

const select = { id: true, email: true, passwordHash: true } as const;

/** The only place in the auth module that talks to Prisma. */
export const userRepository = {
  findByEmail(email: string): Promise<StoredUser | null> {
    return prisma.user.findUnique({ where: { email }, select });
  },

  createWithPassword(email: string, passwordHash: string): Promise<StoredUser> {
    return prisma.user.create({ data: { email, passwordHash }, select });
  },
};

export type UserRepository = typeof userRepository;

/** True when a create failed because the email is already taken (race). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
