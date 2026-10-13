import { z } from "zod";

/** An empty string (as in .env.example) counts as unset. */
const optionalString = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z
  .object({
    DATABASE_URL: z
      .string()
      .regex(/^postgres(ql)?:\/\//, "must be a postgresql:// connection URL"),
    AUTH_SECRET: z.string().min(16, "must be at least 16 characters"),
    // Optional as a pair: Google sign-in is enabled only when both are set.
    AUTH_GOOGLE_ID: optionalString,
    AUTH_GOOGLE_SECRET: optionalString,
  })
  .superRefine((env, ctx) => {
    if (env.AUTH_GOOGLE_ID && !env.AUTH_GOOGLE_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: ["AUTH_GOOGLE_SECRET"],
        message: "required when AUTH_GOOGLE_ID is set",
      });
    }
    if (env.AUTH_GOOGLE_SECRET && !env.AUTH_GOOGLE_ID) {
      ctx.addIssue({
        code: "custom",
        path: ["AUTH_GOOGLE_ID"],
        message: "required when AUTH_GOOGLE_SECRET is set",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Validates an environment-like object. Throws one readable error that lists
 * every problem; it never echoes the offending values (they may be secrets).
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const lines = result.error.issues.map(
    (issue) => `  - ${issue.path.join(".")}: ${issue.message}`
  );
  throw new Error(
    `Invalid environment configuration:\n${lines.join("\n")}\nSee .env.example.`
  );
}

let cached: Env | undefined;

/** Validated configuration read from process.env (memoised). */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
