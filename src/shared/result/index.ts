export type ErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_CONFLICT";

export type ActionError = {
  code: ErrorCode;
  fieldErrors?: Record<string, string[]>;
};

/** Expected outcomes of Server Actions; only unexpected failures throw. */
export type Result<T> =
  { ok: true; data: T } | { ok: false; error: ActionError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail(
  code: ErrorCode,
  fieldErrors?: Record<string, string[]>
): Result<never> {
  return {
    ok: false,
    error: fieldErrors ? { code, fieldErrors } : { code },
  };
}
