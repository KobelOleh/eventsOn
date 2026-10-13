import { z } from "zod";
import { uk } from "@/shared/i18n/uk";

const e = uk.auth.errors;

/** Trimmed and lower-cased so "  Anna@Example.COM " equals "anna@example.com". */
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: e.emailInvalid }));

export const registerSchema = z.object({
  email,
  password: z
    .string()
    .min(8, { error: e.passwordTooShort })
    .max(72, { error: e.passwordTooLong }), // bcrypt ignores bytes past 72
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string().min(1),
});

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}
