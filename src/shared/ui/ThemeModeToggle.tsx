"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useColorScheme } from "@mui/material/styles";
import { uk } from "@/shared/i18n/uk";

type Mode = "light" | "dark" | "system";

const OPTIONS: { value: Mode; glyph: string; label: string }[] = [
  { value: "light", glyph: "☀", label: uk.ui.themeMode.light },
  { value: "system", glyph: "◐", label: uk.ui.themeMode.system },
  { value: "dark", glyph: "☾", label: uk.ui.themeMode.dark },
];

/** Light / system / dark switch; the choice is remembered by MUI. */
export function ThemeModeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      // `mode` is undefined until hydration: select nothing rather than
      // flash "system" and then jump to the stored choice.
      value={mode ?? null}
      aria-label={uk.ui.themeMode.label}
      onChange={(_, next: Mode | null) => {
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
      {OPTIONS.map((option) => (
        <ToggleButton
          key={option.value}
          value={option.value}
          aria-label={option.label}
          title={option.label}
        >
          {option.glyph}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
