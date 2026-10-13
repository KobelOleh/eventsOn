import { resolveEmailConflict } from "./conflict-policy";
import { normaliseEmail } from "./schemas";
import { userRepository } from "./user-repository";

/**
 * Decides whether a Google sign-in may proceed (ADR 0004): `true`, or the
 * path Auth.js should redirect to. Never links accounts.
 */
export async function decideGoogleSignIn(
  email: string
): Promise<true | string> {
  const existing = await userRepository.findByEmail(normaliseEmail(email));
  return resolveEmailConflict("google", existing)
    ? "/login?conflict=password"
    : true;
}
