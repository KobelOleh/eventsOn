import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { uk } from "@/shared/i18n/uk";
import { signInWithGoogle } from "../actions";
import { CredentialsForm } from "./CredentialsForm";

/** `conflict=password` is set by the Google sign-in callback (ADR 0004). */
export function LoginForm({ conflict }: { conflict?: string }) {
  return (
    <>
      <CredentialsForm
        mode="login"
        notice={
          conflict === "password" ? uk.auth.errors.usePassword : undefined
        }
      />
      <Container maxWidth="xs">
        <Box component="form" action={signInWithGoogle}>
          <Button type="submit" variant="outlined" fullWidth>
            {uk.auth.signInWithGoogle}
          </Button>
        </Box>
      </Container>
    </>
  );
}
