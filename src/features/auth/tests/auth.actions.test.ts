import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Only the session boundary is mocked (one seam, real Postgres).
vi.mock("../lib/nextauth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  handlers: {},
}));

import { prisma } from "@/shared/db";
import { uk } from "@/shared/i18n/uk";
import { login, register } from "../actions";
import { createAuthAdapter } from "../lib/adapter";
import { resolveEmailConflict } from "../lib/conflict-policy";
import { createAuthService } from "../lib/auth-service";
import { createPasswordSignIn } from "../lib/password-sign-in";
import { auth, signInWithPassword } from "../lib/nextauth";
import { requireOwnerId, UnauthorizedError } from "../lib/session";

// Stands in for Auth.js: starting a session runs the Credentials provider's
// `authorize` once and lets its refusal reach the caller.
beforeEach(() => {
  const passwordSignIn = createPasswordSignIn(
    createAuthService(),
    async (credentials) => {
      await passwordSignIn.authorize(credentials);
    }
  );
  vi.mocked(signInWithPassword).mockImplementation(passwordSignIn.signIn);
});

describe("register and login", () => {
  beforeEach(async () => {
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a user who can then sign in with the same credentials", async () => {
    const registered = await register({
      email: "anna@example.com",
      password: "correct horse",
    });
    expect(registered.ok).toBe(true);

    const signedIn = await login({
      email: "anna@example.com",
      password: "correct horse",
    });
    expect(signedIn.ok).toBe(true);
  });

  it("rejects a duplicate email regardless of case and surrounding spaces", async () => {
    await register({ email: "anna@example.com", password: "correct horse" });

    const again = await register({
      email: "  Anna@Example.COM ",
      password: "another pass",
    });

    expect(again).toEqual({
      ok: false,
      error: {
        code: "EMAIL_TAKEN",
        fieldErrors: { email: [uk.auth.errors.emailTaken] },
      },
    });
  });

  it("rejects a password shorter than 8 characters with a field error", async () => {
    const result = await register({
      email: "b@example.com",
      password: "short",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "VALIDATION",
        fieldErrors: { password: [uk.auth.errors.passwordTooShort] },
      },
    });
    // and no account was created
    expect(
      await login({ email: "b@example.com", password: "short" })
    ).toMatchObject({ ok: false });
  });

  it("rejects a malformed email with a field error", async () => {
    const result = await register({
      email: "not-an-email",
      password: "long enough",
    });
    expect(result).toMatchObject({
      ok: false,
      error: {
        code: "VALIDATION",
        fieldErrors: { email: [uk.auth.errors.emailInvalid] },
      },
    });
  });

  it("signs in with a differently written email than the one registered", async () => {
    await register({ email: "Carl@Example.com", password: "correct horse" });

    const result = await login({
      email: " carl@example.COM",
      password: "correct horse",
    });

    expect(result).toEqual({ ok: true, data: { email: "carl@example.com" } });
  });

  it("gives the same generic error for an unknown email and a wrong password", async () => {
    await register({ email: "dina@example.com", password: "correct horse" });

    const wrongPassword = await login({
      email: "dina@example.com",
      password: "wrong password",
    });
    const unknownEmail = await login({
      email: "nobody@example.com",
      password: "correct horse",
    });

    expect(wrongPassword).toEqual({
      ok: false,
      error: { code: "INVALID_CREDENTIALS" },
    });
    expect(unknownEmail).toEqual(wrongPassword);
  });
});

describe("an email that belongs to a Google-only user (ADR 0004)", () => {
  beforeEach(async () => {
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    // What Auth.js's adapter creates on a first Google sign-in.
    await createAuthAdapter().createUser!({
      id: "ignored",
      email: "gustav@example.com",
      emailVerified: new Date(),
    });
  });

  it("refuses password sign-in with a message that names Google", async () => {
    const result = await login({
      email: "gustav@example.com",
      password: "whatever pass",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "ACCOUNT_CONFLICT",
        fieldErrors: { form: [uk.auth.errors.useGoogle] },
      },
    });
  });

  it("refuses registration with the same email and names Google", async () => {
    const result = await register({
      email: "Gustav@example.com",
      password: "whatever pass",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "ACCOUNT_CONFLICT",
        fieldErrors: { email: [uk.auth.errors.useGoogle] },
      },
    });
  });
});

describe("resolveEmailConflict", () => {
  it("refuses Google sign-in for an email owned by a password user and names the password", () => {
    expect(resolveEmailConflict("google", { passwordHash: "hash" })).toEqual({
      code: "ACCOUNT_CONFLICT",
      message: uk.auth.errors.usePassword,
    });
  });

  it("lets Google sign-in proceed for a Google user or a new email", () => {
    expect(resolveEmailConflict("google", { passwordHash: null })).toBeNull();
    expect(resolveEmailConflict("google", null)).toBeNull();
  });
});

describe("requireOwnerId", () => {
  it("returns the signed-in user's id", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1" },
      expires: "2999-01-01",
    } as never);
    expect(await requireOwnerId()).toBe("user-1");
  });

  it("throws UnauthorizedError for an anonymous caller", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    await expect(requireOwnerId()).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
