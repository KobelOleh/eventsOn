"use client";

import {
  createTheme,
  type ColorSystemOptions,
  type ThemeOptions,
} from "@mui/material/styles";

type Tone = {
  primary: string;
  background: string;
  paper: string;
  text: string;
  textSecondary: string;
  divider: string;
};

function colorScheme(tone: Tone): ColorSystemOptions {
  return {
    palette: {
      primary: { main: tone.primary },
      background: { default: tone.background, paper: tone.paper },
      text: { primary: tone.text, secondary: tone.textSecondary },
      divider: tone.divider,
    },
  };
}

const channel = (name: string) => `var(--mui-palette-${name}Channel)`;

/** Points FullCalendar's classic-theme variables at the MUI palette so the
 *  grid follows the app's colours and light/dark scheme. `html:root` outranks
 *  the library's own `:root` / `[data-color-scheme=dark]` rules. */
const calendarVariables: NonNullable<ThemeOptions["components"]> = {
  MuiCssBaseline: {
    styleOverrides: {
      "html:root": {
        "--fc-classic-background": "var(--mui-palette-background-paper)",
        "--fc-classic-foreground": "var(--mui-palette-text-primary)",
        "--fc-classic-muted-foreground": "var(--mui-palette-text-secondary)",
        "--fc-classic-faint-foreground": "var(--mui-palette-text-secondary)",
        "--fc-classic-border": "var(--mui-palette-divider)",
        "--fc-classic-strong-border": "var(--mui-palette-text-secondary)",
        "--fc-classic-faint": `rgba(${channel("text-primary")} / 0.04)`,
        "--fc-classic-muted": `rgba(${channel("text-primary")} / 0.08)`,
        "--fc-classic-strong": `rgba(${channel("text-primary")} / 0.14)`,
        "--fc-classic-today": `rgba(${channel("primary-main")} / 0.1)`,
        "--fc-classic-highlight": `rgba(${channel("primary-main")} / 0.18)`,
        "--fc-classic-primary": "var(--mui-palette-primary-main)",
        "--fc-classic-button": "var(--mui-palette-primary-main)",
        "--fc-classic-button-border": "var(--mui-palette-primary-main)",
        "--fc-classic-button-strong": "var(--mui-palette-primary-dark)",
        "--fc-classic-button-strong-border": "var(--mui-palette-primary-dark)",
        "--fc-classic-button-outline": `rgba(${channel("primary-main")} / 0.4)`,
        "--fc-classic-button-foreground":
          "var(--mui-palette-primary-contrastText)",
      },
    },
  },
};

/** The one app theme: soft and rounded, with light and dark colour schemes
 *  that follow the system unless the user picks one (see ThemeModeToggle). */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data" },
  colorSchemes: {
    light: colorScheme({
      primary: "#6c5ce7",
      background: "#f4f3fb",
      paper: "#ffffff",
      text: "#1f1b3a",
      textSecondary: "#6b6785",
      divider: "rgba(31,27,58,0.1)",
    }),
    dark: colorScheme({
      primary: "#a29bfe",
      background: "#13111f",
      paper: "#1d1a2e",
      text: "#ece9ff",
      textSecondary: "#9a96b8",
      divider: "rgba(236,233,255,0.12)",
    }),
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    ...calendarVariables,
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 22 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.text.secondary,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none", borderRadius: 24 } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
          boxShadow: "0 24px 60px rgba(60,40,140,0.3)",
        },
      },
    },
    // Segmented-control look for toggle groups.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 3,
          gap: 2,
          borderRadius: 999,
          backgroundColor: `rgba(${theme.vars.palette.text.primaryChannel} / 0.06)`,
        }),
        grouped: { border: 0, borderRadius: 999 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 0,
          borderRadius: 999,
          paddingInline: 16,
          color: theme.vars.palette.text.secondary,
          "&.Mui-selected, &.Mui-selected:hover": {
            color: theme.vars.palette.primary.contrastText,
            backgroundColor: theme.vars.palette.primary.main,
            boxShadow: `0 2px 8px rgba(${theme.vars.palette.primary.mainChannel} / 0.4)`,
          },
        }),
      },
    },
  },
});
