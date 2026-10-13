import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/shared/db";
import { uk } from "@/shared/i18n/uk";
import { createAuthAdapter } from "../lib/adapter";
import { createAuthService } from "../lib/auth-service";
import { createPasswordSignIn } from "../lib/password-sign-in";
import { userRepository } from "../lib/user-repository";

// Stands in for Auth.js: starting a session runs the provider's `authorize`
// once and lets whatever it throws reach the caller (as raw-mode signIn does).
function setup() {
  const findByEmail = vi.spyOn(userRepository, "findByEmail");
  const service = createAuthService(userRepository);
  const passwordSignIn = createPasswordSignIn(service, async (credentials) => {
    await passwordSignIn.authorize(credentials);
  });
  return { passwordSignIn, findByEmail, service };
}

describe("password sign-in", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("signs a registered user in and returns the normalised email", async () => {
    const { passwordSignIn, service } = setup();
    await service.register({
      email: "a@example.com",
      password: "correct horse",
    });

    expect(
      await passwordSignIn.signIn(" A@Example.COM", "correct horse")
    ).toEqual({ ok: true, data: { email: "a@example.com" } });
  });

  it("checks the credentials once, even when they are refused", async () => {
    const { passwordSignIn, findByEmail, service } = setup();
    await service.register({
      email: "b@example.com",
      password: "correct horse",
    });
    findByEmail.mockClear();

    const result = await passwordSignIn.signIn("b@example.com", "wrong pass");

    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_CREDENTIALS" },
    });
    expect(findByEmail).toHaveBeenCalledTimes(1);
  });

  it("keeps the reason when the email belongs to a Google-only user (ADR 0004)", async () => {
    const { passwordSignIn, findByEmail } = setup();
    await createAuthAdapter().createUser!({
      id: "ignored",
      email: "g@example.com",
      emailVerified: new Date(),
    });
    findByEmail.mockClear();

    const result = await passwordSignIn.signIn(
      "g@example.com",
      "whatever pass"
    );

    expect(result).toEqual({
      ok: false,
      error: {
        code: "ACCOUNT_CONFLICT",
        fieldErrors: { form: [uk.auth.errors.useGoogle] },
      },
    });
    expect(findByEmail).toHaveBeenCalledTimes(1);
  });

  it("lets unexpected failures through instead of reporting bad credentials", async () => {
    const boom = new Error("database down");
    const passwordSignIn = createPasswordSignIn(
      createAuthService(userRepository),
      async () => {
        throw boom;
      }
    );

    await expect(passwordSignIn.signIn("c@example.com", "x")).rejects.toBe(
      boom
    );
  });
});
