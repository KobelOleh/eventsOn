import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { getSessionUser, SignOutButton } from "@/features/auth";
import { uk } from "@/shared/i18n/uk";

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary">
        {uk.app.name}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {uk.app.tagline}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {user?.email} {uk.app.placeholder}
      </Typography>
      <SignOutButton />
    </Container>
  );
}
