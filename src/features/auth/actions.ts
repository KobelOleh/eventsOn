"use server";

import type { Result } from "@/shared/result";
import { createAuthService } from "./lib/auth-service";
import { signIn, signOut } from "./lib/nextauth";

const service = createAuthService();

type Credentials = { email: unknown; password: unknown };

/** Creates an account and signs the new user in. */
export async function register(
  input: Credentials
): Promise<Result<{ email: string }>> {
  const created = await service.register(input);
  if (!created.ok) return created;
  await signIn("credentials", {
    email: created.data.email,
    password: input.password,
    redirect: false,
  });
  return { ok: true, data: { email: created.data.email } };
}

/** Verifies the credentials and starts a JWT session. */
export async function login(
  input: Credentials
): Promise<Result<{ email: string }>> {
  const verified = await service.verifyCredentials(input);
  if (!verified.ok) return verified;
  await signIn("credentials", {
    email: verified.data.email,
    password: input.password,
    redirect: false,
  });
  return { ok: true, data: { email: verified.data.email } };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/** Starts the Google OAuth flow; the callback enforces ADR 0004. */
export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}
