import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Suspense } from "react";
import { getSessionUser, SignOutButton } from "@/features/auth";
import {
  CreateEventFab,
  CreateEventProvider,
  EventsWorkspace,
} from "@/features/events";
import { uk } from "@/shared/i18n/uk";
import { BrandMark } from "@/shared/ui/BrandMark";
import { SoftBackdrop } from "@/shared/ui/SoftBackdrop";
import { ThemeModeToggle } from "@/shared/ui/ThemeModeToggle";

export default async function HomePage() {
  const user = await getSessionUser();
  const name = (user?.email ?? "").split("@")[0];
  return (
    <CreateEventProvider>
      <SoftBackdrop sx={{ px: { xs: 1.5, sm: 3 }, pt: 2, pb: 14 }}>
        <Box sx={{ maxWidth: 1040, mx: "auto" }}>
          <Paper
            component="header"
            elevation={0}
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              boxShadow: "0 8px 30px rgba(70,50,160,0.12)",
            }}
          >
            <BrandMark />
            <Typography sx={{ fontWeight: 800, flexGrow: 1 }}>
              {uk.app.name}
            </Typography>
            <ThemeModeToggle />
            <Chip
              label={user?.email}
              size="small"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            />
            <SignOutButton />
          </Paper>
          <Box sx={{ my: 4, px: 1 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, fontSize: { xs: 28, sm: 40 } }}
            >
              {uk.home.greeting}, {name}
            </Typography>
            <Typography color="text.secondary">{uk.home.subtitle}</Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3.5 },
              boxShadow: "0 16px 50px rgba(70,50,160,0.14)",
            }}
          >
            <Suspense>
              <EventsWorkspace />
            </Suspense>
          </Paper>
        </Box>
        <CreateEventFab />
      </SoftBackdrop>
    </CreateEventProvider>
  );
}
