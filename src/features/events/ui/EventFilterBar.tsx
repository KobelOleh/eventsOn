"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useEffect, useRef, useState } from "react";
import { uk } from "@/shared/i18n/uk";
import { IMPORTANCES, type Importance } from "../lib/schemas";
import type { EventFilterState } from "../lib/view-state";
import { IMPORTANCE_COLORS } from "./importance";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  value: EventFilterState;
  onChange: (patch: Partial<EventFilterState>) => void;
};

/** Multi-select Importance filter and a debounced keyword search. */
export function EventFilterBar({ value, onChange }: Props) {
  const [text, setText] = useState(value.q);
  // The last text this bar reported; a different URL value (e.g. browser
  // Back) is an outside change and replaces what the user sees.
  const reported = useRef(value.q);

  useEffect(() => {
    if (value.q !== reported.current) {
      reported.current = value.q;
      setText(value.q);
    }
  }, [value.q]);

  useEffect(() => {
    const next = text.trim();
    if (next === reported.current) return;
    const id = setTimeout(() => {
      reported.current = next;
      onChange({ q: next });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [text, onChange]);

  const filtered = value.importance.length > 0 || value.q !== "";

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 2,
        mb: 2,
      }}
    >
      <ToggleButtonGroup
        size="small"
        value={value.importance}
        aria-label={uk.filters.importanceLabel}
        onChange={(_, next: Importance[]) =>
          onChange({ importance: IMPORTANCES.filter((l) => next.includes(l)) })
        }
        // Separate pill chips rather than one segmented control.
        sx={{
          backgroundColor: "transparent",
          p: 0,
          gap: 1,
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            border: 1,
            borderStyle: "solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            py: 0.25,
            "&.Mui-selected, &.Mui-selected:hover": {
              bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.16)",
              color: "text.primary",
              borderColor: "primary.main",
              boxShadow: "none",
            },
          },
        }}
      >
        {IMPORTANCES.map((level) => (
          <ToggleButton key={level} value={level} sx={{ gap: 1 }}>
            <Box
              aria-hidden
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: IMPORTANCE_COLORS[level],
              }}
            />
            {uk.importance[level]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <TextField
        size="small"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={uk.filters.searchLabel}
        slotProps={{
          htmlInput: {
            "aria-label": uk.filters.searchLabel,
            maxLength: 200,
          },
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
        sx={{
          minWidth: 260,
          flexGrow: 1,
          maxWidth: 420,
          "& .MuiOutlinedInput-root": { borderRadius: 999 },
        }}
      />
      {filtered && (
        <Button
          size="small"
          onClick={() => {
            setText("");
            reported.current = "";
            onChange({ importance: [], q: "" });
          }}
        >
          {uk.filters.reset}
        </Button>
      )}
    </Box>
  );
}
