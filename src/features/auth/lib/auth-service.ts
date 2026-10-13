import bcrypt from "bcryptjs";
import { fail, ok, type Result } from "@/shared/result";
import { resolveEmailConflict } from "./conflict-policy";
import { loginSchema, registerSchema } from "./schemas";
import {
  isUniqueViolation,
  userRepository,
  type UserRepository,
} from "./user-repository";
import { uk } from "@/shared/i18n/uk";

const BCRYPT_COST = 12;

// Compared against when the email is unknown, so timing does not reveal it.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", BCRYPT_COST);

export type AuthenticatedUser = { id: string; email: string };

export function createAuthService(repo: UserRepository = userRepository) {
  return {
    async register(input: unknown): Promise<Result<AuthenticatedUser>> {
      const parsed = registerSchema.safeParse(input);
      if (!parsed.success) {
        return fail("VALIDATION", fieldErrorsOf(parsed.error.issues));
      }
      const { email, password } = parsed.data;

      const conflict = resolveEmailConflict(
        "register",
        await repo.findByEmail(email)
      );
      if (conflict) return fail(conflict.code, { email: [conflict.message] });

      const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
      try {
        const user = await repo.createWithPassword(email, passwordHash);
        return ok({ id: user.id, email });
      } catch (error) {
        // Lost a race with a concurrent registration of the same email.
        if (isUniqueViolation(error)) {
          return fail("EMAIL_TAKEN", { email: [uk.auth.errors.emailTaken] });
        }
        throw error;
      }
    },

    async verifyCredentials(
      input: unknown
    ): Promise<Result<AuthenticatedUser>> {
      const parsed = loginSchema.safeParse(input);
      if (!parsed.success) return fail("INVALID_CREDENTIALS");
      const { email, password } = parsed.data;

      const user = await repo.findByEmail(email);
      const conflict = resolveEmailConflict("password", user);
      if (conflict) return fail(conflict.code, { form: [conflict.message] });

      const matches = await bcrypt.compare(
        password,
        user?.passwordHash ?? DUMMY_HASH
      );
      if (!user || !matches) return fail("INVALID_CREDENTIALS");
      return ok({ id: user.id, email });
    },
  };
}

function fieldErrorsOf(
  issues: readonly { path: PropertyKey[]; message: string }[]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
