"use client";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { uk } from "@/shared/i18n/uk";
import { toLocalParts } from "../lib/datetime";
import type { EventFilterState } from "../lib/event-filter";
import {
  changeFilter,
  MODES,
  navigateToDate,
  parseViewState,
  switchMode,
  switchView,
  VIEWS,
  type CalendarMode,
  type Transition,
  type View,
} from "../lib/view-state";
import { EventCalendar } from "./EventCalendar";
import { EventFilterBar } from "./EventFilterBar";
import { EventList } from "./EventList";
import { useStableFilter } from "./use-filter";

/** Calendar/List switcher whose state (view, date, and any other params such
 *  as future filters) lives in the URL, so reload and share reproduce it. */
export function EventsWorkspace() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    view,
    mode,
    date,
    filter: parsedFilter,
  } = parseViewState(searchParams);
  const filter = useStableFilter(parsedFilter);

  const run = useCallback(
    (transition: Transition | null) => {
      if (!transition) return;
      const { search, history } = transition;
      const url = search ? `${pathname}?${search}` : pathname;
      // Native History API: Next syncs useSearchParams with it, with no
      // server round trip and no transition delaying the calendar mount.
      window.history[history === "push" ? "pushState" : "replaceState"](
        null,
        "",
        url
      );
    },
    [pathname]
  );

  const onFilterChange = useCallback(
    (patch: Partial<EventFilterState>) =>
      run(changeFilter(window.location.search, patch)),
    [run]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          aria-label={uk.views.label}
          onChange={(_, next: View | null) => {
            if (next) run(switchView(window.location.search, next));
          }}
        >
          {VIEWS.map((v) => (
            <ToggleButton key={v} value={v}>
              {uk.views[v]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {view === "calendar" && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={mode}
            aria-label={uk.modes.label}
            onChange={(_, next: CalendarMode | null) => {
              if (!next) return;
              run(
                switchMode(
                  window.location.search,
                  next,
                  toLocalParts(new Date().toISOString()).date
                )
              );
            }}
          >
            {MODES.map((m) => (
              <ToggleButton key={m} value={m}>
                {uk.modes[m]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Box>
      <EventFilterBar value={filter} onChange={onFilterChange} />
      {view === "calendar" ? (
        <EventCalendar
          initialDate={date ?? undefined}
          mode={mode}
          onDateChange={(next) =>
            run(navigateToDate(window.location.search, next))
          }
          filter={filter}
        />
      ) : (
        <EventList filter={filter} />
      )}
    </Box>
  );
}
