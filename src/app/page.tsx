import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { getSessionUser, SignOutButton } from "@/features/auth";
import { Suspense } from "react";
import { EventsWorkspace } from "@/features/events";
import { uk } from "@/shared/i18n/uk";

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" color="primary">
          {uk.app.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography color="text.secondary">{user?.email}</Typography>
          <SignOutButton />
        </Box>
      </Box>
      <Suspense>
        <EventsWorkspace />
      </Suspense>
    </Container>
  );
}
