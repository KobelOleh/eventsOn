import { Auth, raw, skipCSRFCheck } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import { AuthError, CredentialsSignin } from "next-auth";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/shared/db";
import { uk } from "@/shared/i18n/uk";
import { createAuthAdapter } from "../lib/adapter";
import { createAuthService } from "../lib/auth-service";
import { createPasswordSignIn } from "../lib/password-sign-in";

/** Starts a session through Auth.js' real core instead of a stand-in. */
function signInThroughAuthJs(
  verifier: Parameters<typeof createPasswordSignIn>[0]
) {
  const passwordSignIn = createPasswordSignIn(
    verifier,
    async ({ email, password }) => {
      const request = new Request(
        "http://localhost/auth/callback/credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            email: String(email),
            password: String(password),
            callbackUrl: "http://localhost/",
          }),
        }
      );
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
  return passwordSignIn;
}

const service = createAuthService();
const passwordSignIn = signInThroughAuthJs(service);

// The same flow as production but through Auth.js' real core instead of a
// stand-in, so a version bump that stops rethrowing the refusal from
// `authorize` fails here (see CredentialsRefused).
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

  it("does not report a failure inside authorize as wrong credentials", async () => {
    const broken = signInThroughAuthJs({
      verifyCredentials: async () => {
        throw new Error("database down");
      },
    });

    const failure = await broken.signIn("c@example.com", "whatever pass").then(
      () => null,
      (error: unknown) => error
    );

    expect(failure).toBeInstanceOf(AuthError);
    expect(failure).not.toBeInstanceOf(CredentialsSignin);
  });
});
