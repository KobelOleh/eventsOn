"use client";

// PROTOTYPE (throwaway): same submit logic as features/auth CredentialsForm,
// re-exposed as a hook so each variant can lay the form out differently.
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { login, register } from "@/features/auth/actions";
import { uk } from "@/shared/i18n/uk";
import type { Result } from "@/shared/result";

export type AuthMode = "login" | "register";
type FormState = Extract<Result<unknown>, { ok: false }> | null;

export function useCredentialsForm(mode: AuthMode) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [state, submit, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const input = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      };
      const result = await (isLogin ? login(input) : register(input));
      if (result.ok) {
        // PROTOTYPE: keep the variant being evaluated across the redirect.
        const variant = new URLSearchParams(window.location.search).get(
          "variant"
        );
        router.replace(variant ? `/?variant=${variant}` : "/");
        router.refresh();
        return null;
      }
      return result;
    },
    null
  );
  const fieldErrors = state?.error.fieldErrors ?? {};
  const genericError =
    state?.error.code === "INVALID_CREDENTIALS"
      ? uk.auth.errors.invalidCredentials
      : fieldErrors.form?.[0];
  return { submit, pending, fieldErrors, genericError, isLogin };
}
