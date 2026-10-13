import { Auth, raw, skipCSRFCheck } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/shared/db";
import { uk } from "@/shared/i18n/uk";
import { createAuthAdapter } from "../lib/adapter";
import { createAuthService } from "../lib/auth-service";
import { createPasswordSignIn } from "../lib/password-sign-in";

// The same flow as production but through Auth.js' real core instead of a
// stand-in, so a version bump that stops rethrowing the refusal from
// `authorize` fails here (see CredentialsRefused).
const service = createAuthService();
const passwordSignIn = createPasswordSignIn(
  service,
  async ({ email, password }) => {
    const request = new Request("http://localhost/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: String(email),
        password: String(password),
        callbackUrl: "http://localhost/",
      }),
    });
    return Auth(request, {
      raw,
      skipCSRFCheck,
      basePath: "/auth",
      secret: "test-secret",
      trustHost: true,
      session: { strategy: "jwt" },
      providers: [
        Credentials({
          credentials: { email: {}, password: {} },
          authorize: (credentials) => passwordSignIn.authorize(credentials),
        }),
      ],
    });
  }
);

describe("password sign-in through the real Auth.js core", () => {
  beforeEach(async () => {
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("starts a session for correct credentials", async () => {
    await service.register({
      email: "a@example.com",
      password: "correct horse",
    });

    expect(
      await passwordSignIn.signIn("A@example.com", "correct horse")
    ).toEqual({ ok: true, data: { email: "a@example.com" } });
  });

  it("reports wrong credentials with their reason", async () => {
    await service.register({
      email: "b@example.com",
      password: "correct horse",
    });

    expect(await passwordSignIn.signIn("b@example.com", "wrong pass")).toEqual({
      ok: false,
      error: { code: "INVALID_CREDENTIALS" },
    });
  });

  it("carries the account-conflict reason of ADR 0004 out of Auth.js", async () => {
    await createAuthAdapter().createUser!({
      id: "ignored",
      email: "g@example.com",
      emailVerified: new Date(),
    });

    expect(
      await passwordSignIn.signIn("g@example.com", "whatever pass")
    ).toEqual({
      ok: false,
      error: {
        code: "ACCOUNT_CONFLICT",
        fieldErrors: { form: [uk.auth.errors.useGoogle] },
      },
    });
  });
});
