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

/** Groups validation issues by their first path segment ("form" if none). */
export function fieldErrorsOf(
  issues: readonly { path: PropertyKey[]; message: string }[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
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
