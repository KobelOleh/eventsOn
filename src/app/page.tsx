import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { uk } from "@/shared/i18n/uk";

export default function HomePage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom color="primary">
        {uk.app.name}
      </Typography>
      <Typography variant="h6" gutterBottom>
        {uk.app.tagline}
      </Typography>
      <Typography color="text.secondary">{uk.app.placeholder}</Typography>
    </Container>
  );
}
