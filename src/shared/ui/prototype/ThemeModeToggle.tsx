"use client";

// PROTOTYPE (throwaway): light / dark / system switch shown in each variant.
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useColorScheme } from "@mui/material/styles";
import { uk } from "@/shared/i18n/uk";

const OPTIONS = [
  { value: "light", glyph: "☀", label: uk.ui.themeMode.light },
  { value: "system", glyph: "◐", label: uk.ui.themeMode.system },
  { value: "dark", glyph: "☾", label: uk.ui.themeMode.dark },
] as const;

export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={mode ?? "system"}
      aria-label={uk.ui.themeMode.label}
      onChange={(_, next: "light" | "dark" | "system" | null) => {
        if (next) setMode(next);
      }}
      sx={{
        "& .MuiToggleButton-root": {
          px: 1,
          py: 0.25,
          minWidth: 30,
          lineHeight: 1.5,
          fontSize: 14,
        },
      }}
    >
      {OPTIONS.map((o) => (
        <ToggleButton
          key={o.value}
          value={o.value}
          aria-label={o.label}
          title={o.label}
        >
          {o.glyph}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
