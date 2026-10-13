import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/shared/db";
import { createAuthAdapter } from "../lib/adapter";

/**
 * Research risk #1 (docs/research/auth-calendar-stack.md): does
 * @auth/prisma-adapter work with the Prisma 7 driver-adapter client?
 * These are exactly the adapter calls Auth.js makes on a first Google
 * sign-in with the JWT strategy (getUserByAccount -> getUserByEmail ->
 * createUser -> linkAccount), run against a real Postgres.
 */
describe("Auth.js PrismaAdapter with Prisma 7", () => {
  const adapter = createAuthAdapter();

  beforeEach(async () => {
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a real User row for a first Google sign-in and finds it again", async () => {
    expect(
      await adapter.getUserByAccount!({
        provider: "google",
        providerAccountId: "g-1",
      })
    ).toBeNull();
    expect(await adapter.getUserByEmail!("a@example.com")).toBeNull();

    const created = await adapter.createUser!({
      id: "ignored-by-adapter",
      name: "Anna",
      email: "a@example.com",
      emailVerified: new Date(),
      image: null,
    });
    await adapter.linkAccount!({
      userId: created.id,
      type: "oidc",
      provider: "google",
      providerAccountId: "g-1",
    });

    const again = await adapter.getUserByAccount!({
      provider: "google",
      providerAccountId: "g-1",
    });
    expect(again?.id).toBe(created.id);
    expect(again?.email).toBe("a@example.com");
    expect(await adapter.getUser!(created.id)).toMatchObject({
      email: "a@example.com",
    });
  });

  it("leaves passwordHash null for Google users and sees password users by email", async () => {
    const google = await adapter.createUser!({
      id: "ignored-by-adapter",
      email: "g@example.com",
      emailVerified: null,
    });
    const row = await prisma.user.findUniqueOrThrow({
      where: { id: google.id },
    });
    expect(row.passwordHash).toBeNull();

    await prisma.user.create({
      data: { email: "p@example.com", passwordHash: "hash" },
    });
    // This lookup is what the conflict policy (ADR 0004) builds on.
    expect(await adapter.getUserByEmail!("p@example.com")).toMatchObject({
      email: "p@example.com",
    });
  });

  it("enforces one account per provider identity", async () => {
    const user = await adapter.createUser!({
      id: "ignored-by-adapter",
      email: "u@example.com",
      emailVerified: null,
    });
    const account = {
      userId: user.id,
      type: "oidc" as const,
      provider: "google",
      providerAccountId: "dup",
    };
    await adapter.linkAccount!(account);
    await expect(adapter.linkAccount!(account)).rejects.toThrow();
  });
});
