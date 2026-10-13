"use client";

// PROTOTYPE (throwaway): one MUI theme per UI variant, each with light + dark
// colour schemes (follows the system unless the toggle overrides it).
import {
  createTheme,
  type ColorSystemOptions,
  type Theme,
  type ThemeOptions,
} from "@mui/material/styles";
import type { VariantKey } from "./variants";

type Tone = {
  primary: string;
  bg: string;
  paper: string;
  text: string;
  textSecondary: string;
  divider: string;
};

function scheme(t: Tone): ColorSystemOptions {
  return {
    palette: {
      primary: { main: t.primary },
      background: { default: t.bg, paper: t.paper },
      text: { primary: t.text, secondary: t.textSecondary },
      divider: t.divider,
    },
  };
}

/** Points FullCalendar's classic-theme variables at the MUI palette, so the
 *  grid follows the variant's colours and light/dark scheme. `html:root`
 *  outranks the library's own `:root` / `[data-color-scheme=dark]` rules. */
function fullCalendarVars(): ThemeOptions["components"] {
  const ch = (name: string) => `var(--mui-palette-${name}Channel)`;
  return {
    MuiCssBaseline: {
      styleOverrides: {
        "html:root": {
          "--fc-classic-background": "var(--mui-palette-background-paper)",
          "--fc-classic-foreground": "var(--mui-palette-text-primary)",
          "--fc-classic-muted-foreground": "var(--mui-palette-text-secondary)",
          "--fc-classic-faint-foreground": "var(--mui-palette-text-secondary)",
          "--fc-classic-border": "var(--mui-palette-divider)",
          "--fc-classic-strong-border": "var(--mui-palette-text-secondary)",
          "--fc-classic-faint": `rgba(${ch("text-primary")} / 0.04)`,
          "--fc-classic-muted": `rgba(${ch("text-primary")} / 0.08)`,
          "--fc-classic-strong": `rgba(${ch("text-primary")} / 0.14)`,
          "--fc-classic-today": `rgba(${ch("primary-main")} / 0.1)`,
          "--fc-classic-highlight": `rgba(${ch("primary-main")} / 0.18)`,
          "--fc-classic-primary": "var(--mui-palette-primary-main)",
          "--fc-classic-button": "var(--mui-palette-primary-main)",
          "--fc-classic-button-border": "var(--mui-palette-primary-main)",
          "--fc-classic-button-strong": "var(--mui-palette-primary-dark)",
          "--fc-classic-button-strong-border":
            "var(--mui-palette-primary-dark)",
          "--fc-classic-button-outline": `rgba(${ch("primary-main")} / 0.4)`,
          "--fc-classic-button-foreground":
            "var(--mui-palette-primary-contrastText)",
        },
      },
    },
  };
}

function build(
  options: ThemeOptions,
  extra: ThemeOptions["components"]
): Theme {
  return createTheme({
    ...options,
    cssVariables: { colorSchemeSelector: "data" },
    components: { ...fullCalendarVars(), ...extra },
  });
}

/* ------------------------------------------------------------------ A */
// Notion-like: hairlines, neutral greys, one muted accent, text-weight UI.
const themeA = build(
  {
    colorSchemes: {
      light: scheme({
        primary: "#2f6f95",
        bg: "#ffffff",
        paper: "#ffffff",
        text: "#37352f",
        textSecondary: "rgba(55,53,47,0.65)",
        divider: "rgba(55,53,47,0.16)",
      }),
      dark: scheme({
        primary: "#6aa5c9",
        bg: "#191919",
        paper: "#202020",
        text: "rgba(255,255,255,0.88)",
        textSecondary: "rgba(255,255,255,0.55)",
        divider: "rgba(255,255,255,0.14)",
      }),
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily:
        'ui-sans-serif, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      button: { textTransform: "none", fontWeight: 500 },
    },
  },
  {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 4 },
        outlined: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
          color: theme.vars.palette.text.primary,
        }),
        contained: ({ theme }) => ({
          backgroundColor: theme.vars.palette.text.primary,
          color: theme.vars.palette.background.default,
          "&:hover": { backgroundColor: theme.vars.palette.text.secondary },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          backgroundColor: "transparent",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.text.secondary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1,
            borderColor: theme.vars.palette.primary.main,
          },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px rgba(${theme.vars.palette.primary.mainChannel} / 0.2)`,
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: { gap: 2, border: 0 },
        grouped: { border: 0, borderRadius: 4 },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          border: 0,
          borderRadius: 4,
          color: theme.vars.palette.text.secondary,
          "&.Mui-selected": {
            color: theme.vars.palette.text.primary,
            backgroundColor: `rgba(${theme.vars.palette.text.primaryChannel} / 0.08)`,
          },
        }),
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        }),
      },
    },
  }
);

/* ------------------------------------------------------------------ B */
// Google Calendar-like: Material-ish, blue accent, pill buttons, white canvas.
const themeB = build(
  {
    colorSchemes: {
      light: scheme({
        primary: "#1a73e8",
        bg: "#ffffff",
        paper: "#ffffff",
        text: "#202124",
        textSecondary: "#5f6368",
        divider: "#dadce0",
      }),
      dark: scheme({
        primary: "#8ab4f8",
        bg: "#202124",
        paper: "#292a2d",
        text: "#e8eaed",
        textSecondary: "#9aa0a6",
        divider: "#3c4043",
      }),
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily:
        '"Google Sans", "Product Sans", Roboto, "Segoe UI", system-ui, sans-serif',
      button: { textTransform: "none", fontWeight: 500 },
    },
  },
  {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 999, paddingInline: 20 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 4 } },
    },
    MuiToggleButtonGroup: {
      styleOverrides: { grouped: { borderRadius: 999 } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 999, paddingInline: 14 },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 8 } } },
  }
);

/* ------------------------------------------------------------------ C */
// Soft / rounded: violet accent, big radii, soft shadows, pill controls.
const themeC = build(
  {
    colorSchemes: {
      light: scheme({
        primary: "#6c5ce7",
        bg: "#f4f3fb",
        paper: "#ffffff",
        text: "#1f1b3a",
        textSecondary: "#6b6785",
        divider: "rgba(31,27,58,0.1)",
      }),
      dark: scheme({
        primary: "#a29bfe",
        bg: "#13111f",
        paper: "#1d1a2e",
        text: "#ece9ff",
        textSecondary: "#9a96b8",
        divider: "rgba(236,233,255,0.12)",
      }),
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Nunito", "Segoe UI", system-ui, -apple-system, sans-serif',
      button: { textTransform: "none", fontWeight: 700 },
    },
  },
  {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 999, paddingInline: 22 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          backgroundColor: "transparent",
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
          textTransform: "none",
          border: 0,
          borderRadius: 999,
          paddingInline: 16,
          color: theme.vars.palette.text.secondary,
          "&.Mui-selected, &.Mui-selected:hover": {
            color: theme.vars.palette.primary.contrastText,
            backgroundColor: theme.vars.palette.primary.main,
            boxShadow: "0 2px 8px rgba(108,92,231,0.4)",
          },
        }),
      },
    },
  }
);

export const THEMES: Record<VariantKey, Theme> = {
  A: themeA,
  B: themeB,
  C: themeC,
};
