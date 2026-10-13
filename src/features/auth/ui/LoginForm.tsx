import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { uk } from "@/shared/i18n/uk";
import { signInWithGoogle } from "../actions";
import { googleConfigured } from "../lib/nextauth";
import { CredentialsForm } from "./CredentialsForm";
import { GoogleMark } from "./icons";

/** `conflict=password` is set by the Google sign-in callback (ADR 0004). */
export function LoginForm({ conflict }: { conflict?: string }) {
  return (
    <CredentialsForm
      mode="login"
      notice={conflict === "password" ? uk.auth.errors.usePassword : undefined}
    >
      {googleConfigured && (
        <>
          <Divider sx={{ my: 3, color: "text.secondary", fontSize: 13 }}>
            {uk.auth.or}
          </Divider>
          <Box component="form" action={signInWithGoogle}>
            <Button
              type="submit"
              variant="outlined"
              fullWidth
              startIcon={<GoogleMark />}
              sx={{ py: 1.2 }}
            >
              {uk.auth.signInWithGoogle}
            </Button>
          </Box>
        </>
      )}
    </CredentialsForm>
  );
}
