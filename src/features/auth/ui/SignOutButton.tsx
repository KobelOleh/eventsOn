import Button from "@mui/material/Button";
import { uk } from "@/shared/i18n/uk";
import { signOutAction } from "../actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outlined">
        {uk.auth.signOut}
      </Button>
    </form>
  );
}
