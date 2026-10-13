"use client";

// PROTOTYPE (throwaway, branch prototype/ui-redesign): three layouts of the
// signed-in home screen, switched by ?variant=A|B|C on the existing `/` route.
// They wrap/re-layout the real EventsWorkspace; the events logic is untouched.
//   A  Notion-like     slim bar, big page title, inline toolbar, whitespace
//   B  Google-like     left sidebar (create, views, filters) + thin top bar
//   C  Soft / rounded  floating pill header, cards, pill chips, FAB
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { Suspense, useEffect, useState } from "react";
import {
  EventsWorkspace,
  IMPORTANCE_COLORS,
  IMPORTANCES,
  MODES,
  VIEWS,
  dateForModeSwitch,
  toLocalParts,
  type CalendarMode,
  type Importance,
} from "@/features/events";
import { uk } from "@/shared/i18n/uk";
import { ThemeModeToggle } from "@/shared/ui/prototype/ThemeModeToggle";
import { useVariant } from "@/shared/ui/prototype/useVariant";
import {
  AccountMenu,
  openCreateFlow,
  SignOut,
  useWorkspaceUrl,
} from "./shared";

type Props = { email?: string | null };

/* ---------------------------------------------------------------- A */
function HomeA({ email }: Props) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
      <Box
        component="header"
        sx={{
          height: 44,
          px: { xs: 1.5, sm: 3 },
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {uk.app.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          {email}
        </Typography>
        <ThemeModeToggle />
        <SignOut />
      </Box>
      <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, sm: 6 }, pt: 8 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{ fontSize: { xs: 34, sm: 44 }, mb: 1 }}
        >
          {uk.home.title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {uk.home.subtitle}
        </Typography>
        <Box
          sx={{
            borderTop: 1,
            borderColor: "divider",
            pt: 2,
            "& .fc": { "--fc-classic-today": "transparent" },
          }}
        >
          <Suspense>
            <EventsWorkspace />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------- B */
function SearchBox() {
  const { state, update } = useWorkspaceUrl();
  const [text, setText] = useState(state.q);
  useEffect(() => {
    const next = text.trim();
    if (next === state.q) return;
    const id = setTimeout(() => update({ q: next }), 300);
    return () => clearTimeout(id);
  }, [text, state.q, update]);
  return (
    <TextField
      size="small"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={uk.filters.searchLabel}
      sx={{
        flexGrow: 1,
        maxWidth: 420,
        "& .MuiOutlinedInput-root": { borderRadius: 999 },
      }}
      slotProps={{
        htmlInput: { "aria-label": uk.filters.searchLabel, maxLength: 200 },
        input: {
          endAdornment: text ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label={uk.filters.clearSearch}
                onClick={() => setText("")}
              >
                ×
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}

function SidebarContent({ onDone }: { onDone?: () => void }) {
  const { state, update } = useWorkspaceUrl();
  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
        {uk.app.name}
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => {
          onDone?.();
          openCreateFlow(state.view, update);
        }}
        sx={{ alignSelf: "flex-start", px: 3, py: 1.25, boxShadow: 3 }}
      >
        + {uk.ui.create}
      </Button>
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1, display: "block" }}
        >
          {uk.views.label}
        </Typography>
        <List dense disablePadding>
          {VIEWS.map((v) => (
            <ListItemButton
              key={v}
              selected={state.view === v}
              onClick={() => {
                update({ view: v }, "push");
                onDone?.();
              }}
              sx={{ borderRadius: 999 }}
            >
              <ListItemText primary={uk.views[v]} />
            </ListItemButton>
          ))}
        </List>
      </Box>
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1, display: "block" }}
        >
          {uk.filters.importanceLabel}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", px: 1 }}>
          {IMPORTANCES.map((level: Importance) => (
            <FormControlLabel
              key={level}
              label={uk.importance[level]}
              control={
                <Checkbox
                  size="small"
                  checked={state.importance.includes(level)}
                  onChange={(_, checked) =>
                    update({
                      importance: IMPORTANCES.filter((l) =>
                        l === level ? checked : state.importance.includes(l)
                      ),
                    })
                  }
                  sx={{
                    color: IMPORTANCE_COLORS[level],
                    "&.Mui-checked": { color: IMPORTANCE_COLORS[level] },
                  }}
                />
              }
            />
          ))}
        </Box>
        {(state.importance.length > 0 || state.q) && (
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={() => update({ importance: [], q: "" })}
          >
            {uk.filters.reset}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function HomeB({ email }: Props) {
  const { state, update } = useWorkspaceUrl();
  const [drawer, setDrawer] = useState(false);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 256,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          alignSelf: "flex-start",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <SidebarContent />
      </Box>
      <Drawer open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: 280 }}>
          <SidebarContent onDone={() => setDrawer(false)} />
        </Box>
      </Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0, pb: 10 }}>
        <Box
          component="header"
          sx={{
            minHeight: 56,
            px: { xs: 1, md: 2 },
            py: 0.75,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <IconButton
            aria-label={uk.ui.menu}
            onClick={() => setDrawer(true)}
            sx={{ display: { md: "none" } }}
          >
            ☰
          </IconButton>
          {state.view === "calendar" && (
            <ToggleButtonGroup
              exclusive
              size="small"
              value={state.mode}
              aria-label={uk.modes.label}
              onChange={(_, next: CalendarMode | null) => {
                if (!next) return;
                const anchor =
                  state.mode === "month" && next !== "month"
                    ? dateForModeSwitch(
                        state.date,
                        toLocalParts(new Date().toISOString()).date
                      )
                    : state.date;
                update({ mode: next, date: anchor }, "push");
              }}
            >
              {MODES.map((m) => (
                <ToggleButton key={m} value={m}>
                  {uk.modes[m]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
          <SearchBox />
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}
          >
            <ThemeModeToggle />
            <AccountMenu email={email} />
          </Box>
        </Box>
        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Suspense>
            <EventsWorkspace hideControls />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------------------------------------------------------- C */
function HomeC({ email }: Props) {
  const { state, update } = useWorkspaceUrl();
  const name = (email ?? "").split("@")[0];
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 14,
        px: { xs: 1.5, sm: 3 },
        pt: 2,
        background:
          "radial-gradient(900px 500px at 10% 0%, rgba(var(--mui-palette-primary-mainChannel) / 0.2), transparent 60%), radial-gradient(700px 500px at 100% 40%, rgba(255,140,200,0.15), transparent 60%), var(--mui-palette-background-default)",
      }}
    >
      <Box sx={{ maxWidth: 1040, mx: "auto" }}>
        <Paper
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
          <Box
            aria-hidden
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8e7bff, #ff7eb6)",
            }}
          />
          <Typography sx={{ fontWeight: 800, flexGrow: 1 }}>
            {uk.app.name}
          </Typography>
          <ThemeModeToggle />
          <Chip
            label={email}
            size="small"
            sx={{ display: { xs: "none", sm: "inline-flex" } }}
          />
          <SignOut variant="outlined" />
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
            // Importance filter -> separate pill chips.
            [`& [aria-label="${uk.filters.importanceLabel}"]`]: {
              backgroundColor: "transparent",
              padding: 0,
              gap: 1,
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                border: 1,
                borderStyle: "solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                py: 0.25,
                "&.Mui-selected, &.Mui-selected:hover": {
                  bgcolor:
                    "rgba(var(--mui-palette-primary-mainChannel) / 0.16)",
                  color: "text.primary",
                  borderColor: "primary.main",
                  boxShadow: "none",
                },
              },
            },
          }}
        >
          <Suspense>
            <EventsWorkspace />
          </Suspense>
        </Paper>
      </Box>
      <Fab
        color="primary"
        variant="extended"
        aria-label={uk.ui.create}
        onClick={() => openCreateFlow(state.view, update)}
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 32 },
          bottom: { xs: 64, sm: 32 },
          fontWeight: 700,
          boxShadow: "0 12px 30px rgba(108,92,231,0.5)",
        }}
      >
        + {uk.ui.create}
      </Fab>
    </Box>
  );
}

export function HomeVariants(props: Props) {
  const variant = useVariant();
  if (variant === "B") return <HomeB {...props} />;
  if (variant === "C") return <HomeC {...props} />;
  return <HomeA {...props} />;
}
