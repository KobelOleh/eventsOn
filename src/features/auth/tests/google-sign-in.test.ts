import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/shared/db";
import { createAuthAdapter } from "../lib/adapter";
import { decideGoogleSignIn } from "../lib/google-sign-in";

describe("Google sign-in decision (ADR 0004)", () => {
  beforeEach(async () => {
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("lets a first-time Google email through and the adapter creates a real user", async () => {
    expect(await decideGoogleSignIn("New@Example.com")).toBe(true);

    const adapter = createAuthAdapter();
    const user = await adapter.createUser!({
      id: "ignored",
      email: "new@example.com",
      emailVerified: null,
    });
    expect(
      await prisma.user.findUnique({ where: { id: user.id } })
    ).toMatchObject({ email: "new@example.com", passwordHash: null });
  });

  it("lets a returning Google-only user through", async () => {
    await prisma.user.create({ data: { email: "g@example.com" } });
    expect(await decideGoogleSignIn("g@example.com")).toBe(true);
  });

  it("refuses an email owned by a password account, redirecting to /login, and links nothing", async () => {
    await prisma.user.create({
      data: { email: "p@example.com", passwordHash: "hash" },
    });

    expect(await decideGoogleSignIn(" P@Example.com ")).toBe(
      "/login?conflict=password"
    );
    expect(await prisma.account.count()).toBe(0);
    expect(await prisma.user.count()).toBe(1);
  });
});
