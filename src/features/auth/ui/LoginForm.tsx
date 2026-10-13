import { uk } from "@/shared/i18n/uk";
import { CredentialsForm } from "./CredentialsForm";

/** `conflict=password` is set by the Google sign-in callback (ADR 0004). */
export function LoginForm({ conflict }: { conflict?: string }) {
  return (
    <CredentialsForm
      mode="login"
      notice={conflict === "password" ? uk.auth.errors.usePassword : undefined}
    />
  );
}
