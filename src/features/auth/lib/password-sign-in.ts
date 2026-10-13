import { AuthError, CredentialsSignin } from "next-auth";
import { ok, type ActionError, type Result } from "@/shared/result";
import type { AuthenticatedUser } from "./auth-service";
import { normaliseEmail } from "./schemas";

/** Thrown by `authorize` instead of returning null, so the refusal reaches the
 *  caller of Auth.js `signIn` unchanged (raw mode rethrows AuthError
 *  instances) together with the reason; nothing is verified a second time. */
export class CredentialsRefused extends CredentialsSignin {
  readonly refusal: ActionError;

  constructor(refusal: ActionError) {
    super();
    this.refusal = refusal;
  }
}

type Credentials = { email: unknown; password: unknown };

/**
 * Email-and-password sign-in on top of Auth.js: the credentials are verified
 * exactly once, inside the Credentials provider's `authorize`, and a refusal
 * comes back as a Result that says why (wrong credentials, or the ADR 0004
 * account conflict). `startSession` runs Auth.js `signIn` for the provider.
 */
export function createPasswordSignIn(
  verifier: {
    verifyCredentials(input: unknown): Promise<Result<AuthenticatedUser>>;
  },
  startSession: (credentials: Credentials) => Promise<unknown>
) {
  return {
    /** The Credentials provider's `authorize`. */
    async authorize(credentials: unknown): Promise<AuthenticatedUser> {
      const result = await verifier.verifyCredentials(credentials);
      if (!result.ok) throw new CredentialsRefused(result.error);
      return result.data;
    },

    /** Starts a JWT session; a refusal is returned, anything else throws. */
    async signIn(
      email: unknown,
      password: unknown
    ): Promise<Result<{ email: string }>> {
      try {
        await startSession({ email, password });
        return ok({ email: normaliseEmail(String(email)) });
      } catch (error) {
        if (error instanceof CredentialsRefused) {
          return { ok: false, error: error.refusal };
        }
        // Auth.js refused without our reason: report it as bad credentials.
        if (error instanceof AuthError) {
          return { ok: false, error: { code: "INVALID_CREDENTIALS" } };
        }
        throw error;
      }
    },
  };
}
