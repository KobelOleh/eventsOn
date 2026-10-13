"use client";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { uk } from "@/shared/i18n/uk";
import {
  parseViewState,
  VIEWS,
  withViewState,
  type ViewState,
} from "../lib/view-state";
import { EventCalendar } from "./EventCalendar";
import { EventList } from "./EventList";

/** Calendar/List switcher whose state (view, date, and any other params such
 *  as future filters) lives in the URL, so reload and share reproduce it. */
export function EventsWorkspace() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { view, date } = parseViewState(searchParams);

  const update = useCallback(
    (patch: Partial<ViewState>, mode: "push" | "replace") => {
      const query = withViewState(window.location.search, patch);
      const url = query ? `${pathname}?${query}` : pathname;
      // Native History API: Next syncs useSearchParams with it, with no
      // server round trip and no transition delaying the calendar mount.
      window.history[mode === "push" ? "pushState" : "replaceState"](
        null,
        "",
        url
      );
    },
    [pathname]
  );

  return (
    <Box>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={view}
        aria-label={uk.views.label}
        onChange={(_, next: ViewState["view"] | null) => {
          if (next) update({ view: next }, "push");
        }}
        sx={{ mb: 2 }}
      >
        {VIEWS.map((v) => (
          <ToggleButton key={v} value={v}>
            {uk.views[v]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {view === "calendar" ? (
        <EventCalendar
          initialDate={date ?? undefined}
          onDateChange={(next) => update({ date: next }, "replace")}
        />
      ) : (
        <EventList />
      )}
    </Box>
  );
}
