import { uk } from "@/shared/i18n/uk";
import type { ErrorCode } from "@/shared/result";

/**
 * The account-conflict policy of ADR 0004, in one place. Accounts are never
 * linked automatically: an email belongs to exactly one sign-in method
 * ("password" if it has a passwordHash, otherwise Google) and an attempt with
 * the other method is refused with a message naming the right one.
 * Replace this function to introduce verified-email linking later.
 */
export type SignInAttempt = "register" | "password" | "google";

export type ExistingUser = { passwordHash: string | null } | null;

export type EmailConflict = {
  code: Extract<ErrorCode, "EMAIL_TAKEN" | "ACCOUNT_CONFLICT">;
  message: string;
};

const { emailTaken, useGoogle, usePassword } = uk.auth.errors;

/** Returns the refusal for this attempt, or null when it may proceed. */
export function resolveEmailConflict(
  attempt: SignInAttempt,
  existing: ExistingUser
): EmailConflict | null {
  if (!existing) return null;
  const googleOnly = existing.passwordHash === null;

  switch (attempt) {
    case "register":
      return googleOnly
        ? { code: "ACCOUNT_CONFLICT", message: useGoogle }
        : { code: "EMAIL_TAKEN", message: emailTaken };
    case "password":
      return googleOnly
        ? { code: "ACCOUNT_CONFLICT", message: useGoogle }
        : null;
    case "google":
      return googleOnly
        ? null
        : { code: "ACCOUNT_CONFLICT", message: usePassword };
  }
}
