import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, "must be a postgresql:// connection URL"),
  AUTH_SECRET: z.string().min(16, "must be at least 16 characters"),
  AUTH_GOOGLE_ID: z.string().min(1, "must not be empty"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "must not be empty"),
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
