"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { uk } from "@/shared/i18n/uk";
import type { Result } from "@/shared/result";
import { login, register } from "../actions";

type Mode = "login" | "register";
type FormState = Extract<Result<unknown>, { ok: false }> | null;

export function CredentialsForm({
  mode,
  notice,
}: {
  mode: Mode;
  notice?: string;
}) {
  const router = useRouter();
  const t = uk.auth;
  const isLogin = mode === "login";

  const [state, submit, pending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const input = {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      };
      const result = await (isLogin ? login(input) : register(input));
      if (result.ok) {
        router.replace("/");
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
      ? t.errors.invalidCredentials
      : fieldErrors.form?.[0];

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isLogin ? t.loginTitle : t.registerTitle}
      </Typography>
      {notice && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      {genericError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {genericError}
        </Alert>
      )}
      <Box component="form" action={submit} noValidate>
        <TextField
          name="email"
          type="email"
          label={t.email}
          autoComplete="email"
          fullWidth
          margin="normal"
          required
          error={Boolean(fieldErrors.email)}
          helperText={fieldErrors.email?.[0]}
        />
        <TextField
          name="password"
          type="password"
          label={t.password}
          autoComplete={isLogin ? "current-password" : "new-password"}
          fullWidth
          margin="normal"
          required
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password?.[0]}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={pending}
          sx={{ mt: 2 }}
        >
          {isLogin ? t.signIn : t.register}
        </Button>
      </Box>
      <Link
        component={NextLink}
        href={isLogin ? "/register" : "/login"}
        sx={{ display: "block", mt: 2 }}
      >
        {isLogin ? t.toRegister : t.toLogin}
      </Link>
    </Container>
  );
}
