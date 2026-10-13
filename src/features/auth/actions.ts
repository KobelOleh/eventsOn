"use server";

import { ok, type Result } from "@/shared/result";
import { createAuthService } from "./lib/auth-service";
import { signIn, signInWithPassword, signOut } from "./lib/nextauth";

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
  return ok({ email: created.data.email });
}

/** Starts a JWT session; the credentials are verified once, by the provider
 *  inside `signIn`, and a refusal carries its reason. */
export async function login(
  input: Credentials
): Promise<Result<{ email: string }>> {
  return signInWithPassword(input.email, input.password);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

/** Starts the Google OAuth flow; the callback enforces ADR 0004. */
export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}
