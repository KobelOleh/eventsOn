"use client";

// PROTOTYPE (throwaway, branch prototype/ui-redesign): three login/register
// layouts switched by ?variant=A|B|C on the existing /login and /register.
//   A  Notion-like     centered, no card, labels above hairline inputs
//   B  Google-like     split screen: CSS-only brand panel + form
//   C  Soft / rounded  elevated rounded card on a gradient, icons in inputs
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { signInWithGoogle } from "@/features/auth/actions";
import { uk } from "@/shared/i18n/uk";
import { ThemeModeToggle } from "@/shared/ui/prototype/ThemeModeToggle";
import { useVariant } from "@/shared/ui/prototype/useVariant";
import { AuthFields, GoogleMark } from "./AuthFields";
import { useCredentialsForm, type AuthMode } from "./useCredentialsForm";

type Props = { mode: AuthMode; conflict?: string };

function useForm(mode: AuthMode, conflict?: string) {
  const form = useCredentialsForm(mode);
  const t = uk.auth;
  const notice = conflict === "password" ? t.errors.usePassword : undefined;
  const alerts = (
    <>
      {notice && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}
      {form.genericError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {form.genericError}
        </Alert>
      )}
    </>
  );
  return { ...form, alerts, t };
}

function GoogleButton({ sx }: { sx?: object }) {
  return (
    <Box component="form" action={signInWithGoogle}>
      <Button
        type="submit"
        variant="outlined"
        fullWidth
        startIcon={<GoogleMark />}
        sx={sx}
      >
        {uk.auth.signInWithGoogle}
      </Button>
    </Box>
  );
}

function SwitchLink({ mode }: { mode: AuthMode }) {
  return (
    <Link
      component={NextLink}
      href={mode === "login" ? "/register" : "/login"}
      underline="hover"
      variant="body2"
    >
      {mode === "login" ? uk.auth.toRegister : uk.auth.toLogin}
    </Link>
  );
}

/* ---------------------------------------------------------------- A */
function AuthA({ mode, conflict }: Props) {
  const f = useForm(mode, conflict);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1.5 }}>
        <ThemeModeToggle />
      </Box>
      <Box sx={{ maxWidth: 360, mx: "auto", px: 3, pt: { xs: 4, sm: "9vh" } }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600, mb: 3 }}
        >
          {uk.app.name}
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontSize: { xs: 34, sm: 44 }, mb: 1 }}
        >
          {f.isLogin ? f.t.loginTitle : f.t.registerTitle}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {f.isLogin ? f.t.loginSubtitle : f.t.registerSubtitle}
        </Typography>
        {f.alerts}
        <GoogleButton
          sx={{ justifyContent: "flex-start", py: 0.9, fontWeight: 500 }}
        />
        <Divider sx={{ my: 3, color: "text.secondary", fontSize: 13 }}>
          {f.t.or}
        </Divider>
        <Box component="form" action={f.submit} noValidate>
          <AuthFields mode={mode} errors={f.fieldErrors} variant="above" />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={f.pending}
            sx={{ mt: 1, py: 1 }}
          >
            {f.isLogin ? f.t.signIn : f.t.register}
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          <SwitchLink mode={mode} />
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------- B */
function BrandPanel() {
  // CSS-only "calendar" illustration: gradient + grid + faux event blocks.
  const block = (top: string, left: string, w: string, c: string) => (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top,
        left,
        width: w,
        height: 22,
        borderRadius: 1,
        bgcolor: c,
        opacity: 0.92,
      }}
    />
  );
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        p: { md: 6 },
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "linear-gradient(135deg, #1a73e8 0%, #174ea6 60%, #0b2f6b 100%)",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(160deg, transparent 5%, #000 70%)",
        }}
      />
      {block("22%", "12%", "34%", "#fbbc04")}
      {block("29%", "30%", "40%", "#34a853")}
      {block("36%", "16%", "28%", "#ea4335")}
      {block("43%", "42%", "36%", "#8ab4f8")}
      <Typography variant="h5" sx={{ fontWeight: 600, position: "relative" }}>
        {uk.app.name}
      </Typography>
      <Box sx={{ position: "relative", maxWidth: 420 }}>
        <Typography variant="h3" sx={{ fontWeight: 500, mb: 2 }}>
          {uk.auth.brandHeadline}
        </Typography>
        <Typography sx={{ opacity: 0.85 }}>{uk.auth.brandText}</Typography>
      </Box>
    </Box>
  );
}

function AuthB({ mode, conflict }: Props) {
  const f = useForm(mode, conflict);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      <BrandPanel />
      <Box sx={{ display: "flex", flexDirection: "column", pb: 10 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
          }}
        >
          <Typography
            sx={{
              display: { md: "none" },
              fontWeight: 600,
              color: "primary.main",
              pl: 1,
            }}
          >
            {uk.app.name}
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <ThemeModeToggle />
          </Box>
        </Box>
        <Box sx={{ m: "auto", width: "100%", maxWidth: 400, px: 3, py: 4 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            {f.isLogin ? f.t.loginTitle : f.t.registerTitle}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {f.isLogin ? f.t.loginSubtitle : f.t.registerSubtitle}
          </Typography>
          {f.alerts}
          <Box component="form" action={f.submit} noValidate>
            <AuthFields mode={mode} errors={f.fieldErrors} variant="above" />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={f.pending}
              sx={{ mt: 1 }}
            >
              {f.isLogin ? f.t.signIn : f.t.register}
            </Button>
          </Box>
          <Divider sx={{ my: 3, color: "text.secondary", fontSize: 13 }}>
            {f.t.or}
          </Divider>
          <GoogleButton sx={{ py: 1 }} />
          <Box sx={{ mt: 3 }}>
            <SwitchLink mode={mode} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------- C */
function AuthC({ mode, conflict }: Props) {
  const f = useForm(mode, conflict);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        pb: 10,
        position: "relative",
        background:
          "radial-gradient(900px 500px at 15% 10%, rgba(var(--mui-palette-primary-mainChannel) / 0.28), transparent 60%), radial-gradient(800px 500px at 90% 90%, rgba(255,140,200,0.22), transparent 60%), var(--mui-palette-background-default)",
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
          boxShadow: "0 24px 70px rgba(70,50,160,0.18)",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 52,
            height: 52,
            borderRadius: 4,
            mb: 2.5,
            background: "linear-gradient(135deg, #8e7bff, #ff7eb6)",
            boxShadow: "0 8px 20px rgba(142,123,255,0.45)",
          }}
        />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
          {f.isLogin ? f.t.loginTitle : f.t.registerTitle}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, mt: 0.5 }}>
          {f.isLogin ? f.t.loginSubtitle : f.t.registerSubtitle}
        </Typography>
        {f.alerts}
        <Box component="form" action={f.submit} noValidate>
          <AuthFields
            mode={mode}
            errors={f.fieldErrors}
            variant="pinned"
            icons
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={f.pending}
            sx={{
              mt: 2,
              py: 1.4,
              background: "linear-gradient(135deg, #7c6cf0, #a46cf0)",
              color: "#fff",
              boxShadow: "0 8px 20px rgba(124,108,240,0.4)",
            }}
          >
            {f.isLogin ? f.t.signIn : f.t.register}
          </Button>
        </Box>
        <Divider sx={{ my: 3, color: "text.secondary", fontSize: 13 }}>
          {f.t.or}
        </Divider>
        <GoogleButton sx={{ py: 1.2 }} />
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <SwitchLink mode={mode} />
        </Box>
      </Paper>
    </Box>
  );
}

export function AuthVariants(props: Props) {
  const variant = useVariant();
  if (variant === "B") return <AuthB {...props} />;
  if (variant === "C") return <AuthC {...props} />;
  return <AuthA {...props} />;
}
