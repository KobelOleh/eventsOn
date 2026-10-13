"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, type ReactNode } from "react";
import { uk } from "@/shared/i18n/uk";
import type { Result } from "@/shared/result";
import { BrandMark } from "@/shared/ui/BrandMark";
import { SoftBackdrop } from "@/shared/ui/SoftBackdrop";
import { ThemeModeToggle } from "@/shared/ui/ThemeModeToggle";
import { login, register } from "../actions";
import { LockIcon, MailIcon } from "./icons";

type Mode = "login" | "register";
type Failure = Extract<Result<unknown>, { ok: false }>;
/** The email travels with the failure: React resets the form's fields after
 *  every action, and the user should not have to retype it. */
type FormState =
  | { failure: Failure; email: string }
  | { unexpected: true; email: string }
  | null;

function Field({
  name,
  type,
  label,
  placeholder,
  autoComplete,
  icon,
  errors,
  defaultValue,
}: {
  name: string;
  type: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  icon: ReactNode;
  errors?: string[];
  defaultValue?: string;
}) {
  return (
    <TextField
      name={name}
      type={type}
      defaultValue={defaultValue}
      label={label}
      placeholder={placeholder}
      autoComplete={autoComplete}
      fullWidth
      margin="normal"
      required
      error={Boolean(errors)}
      // Slides in instead of popping in, so the fields below glide down.
      helperText={
        errors ? (
          <Collapse in appear>
            {errors[0]}
          </Collapse>
        ) : undefined
      }
      slotProps={{
        // Always-shrunk label: it can never overlap typed or autofilled text.
        inputLabel: { shrink: true },
        input: {
          startAdornment: (
            <InputAdornment position="start">{icon}</InputAdornment>
          ),
        },
      }}
    />
  );
}

/** Login/register card. `children` (e.g. the Google button) render below the
 *  form, above the link to the other mode. */
export function CredentialsForm({
  mode,
  notice,
  children,
}: {
  mode: Mode;
  notice?: string;
  children?: ReactNode;
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
      let result: Result<unknown>;
      try {
        result = await (isLogin ? login(input) : register(input));
      } catch {
        // An unexpected failure (e.g. the database is down) is not a wrong
        // password: say so in the form instead of crashing the page.
        return { unexpected: true, email: input.email };
      }
      if (result.ok) {
        router.replace("/");
        router.refresh();
        return null;
      }
      return { failure: result, email: input.email };
    },
    null
  );

  const failure = state && "failure" in state ? state.failure : null;
  const fieldErrors = failure?.error.fieldErrors ?? {};
  const genericError =
    state && "unexpected" in state
      ? t.errors.unexpected
      : failure?.error.code === "INVALID_CREDENTIALS"
        ? t.errors.invalidCredentials
        : fieldErrors.form?.[0];

  return (
    <SoftBackdrop
      strong
      sx={{
        display: "flex",
        // Top-anchored: an error growing the card must not re-centre it and
        // move the title and fields that are already on screen.
        alignItems: "flex-start",
        justifyContent: "center",
        p: 2,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeModeToggle />
      </Box>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 5 },
          mt: { xs: 6, sm: "12vh" },
          boxShadow: "0 24px 70px rgba(70,50,160,0.18)",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ mb: 2.5 }}>
          <BrandMark size={52} round={false} />
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          {isLogin ? t.loginTitle : t.registerTitle}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, mt: 0.5 }}>
          {isLogin ? t.loginSubtitle : t.registerSubtitle}
        </Typography>
        {notice && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {notice}
          </Alert>
        )}
        <Collapse in={Boolean(genericError)} mountOnEnter unmountOnExit>
          <Alert severity="error" sx={{ mb: 2 }}>
            {genericError}
          </Alert>
        </Collapse>
        <Box component="form" action={submit} noValidate>
          <Field
            name="email"
            type="email"
            label={t.email}
            placeholder={t.emailPlaceholder}
            autoComplete="email"
            icon={<MailIcon />}
            errors={fieldErrors.email}
            defaultValue={state?.email}
          />
          <Field
            name="password"
            type="password"
            label={t.password}
            placeholder={t.passwordPlaceholder}
            autoComplete={isLogin ? "current-password" : "new-password"}
            icon={<LockIcon />}
            errors={fieldErrors.password}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            loading={pending}
            sx={{ mt: 2, py: 1.4 }}
          >
            {isLogin ? t.signIn : t.register}
          </Button>
        </Box>
        {children}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Link
            component={NextLink}
            href={isLogin ? "/register" : "/login"}
            underline="hover"
            variant="body2"
          >
            {isLogin ? t.toRegister : t.toLogin}
          </Link>
        </Box>
      </Paper>
    </SoftBackdrop>
  );
}
