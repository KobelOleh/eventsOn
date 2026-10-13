"use client";

// PROTOTYPE (throwaway): picks the MUI theme of the active ?variant=.
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { THEMES } from "./themes";
import { useVariant } from "./useVariant";

export function PrototypeThemeProvider({ children }: { children: ReactNode }) {
  const variant = useVariant();
  return (
    <ThemeProvider theme={THEMES[variant]} defaultMode="system">
      {children}
    </ThemeProvider>
  );
}
