"use client";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { uk } from "@/shared/i18n/uk";
import { toLocalParts } from "../lib/datetime";
import {
  dateForModeSwitch,
  MODES,
  parseViewState,
  VIEWS,
  withViewState,
  type CalendarMode,
  type EventFilterState,
  type ViewState,
} from "../lib/view-state";
import { EventCalendar } from "./EventCalendar";
import { EventFilterBar } from "./EventFilterBar";
import { EventList } from "./EventList";

/** Calendar/List switcher whose state (view, date, and any other params such
 *  as future filters) lives in the URL, so reload and share reproduce it. */
export function EventsWorkspace({
  hideControls = false,
}: {
  /** PROTOTYPE (ui-redesign): the layout supplies its own toolbar/filter. */
  hideControls?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { view, mode, date, importance, q } = parseViewState(searchParams);
  const importanceKey = importance.join(",");
  const filter = useMemo(
    () => ({ importance: importanceKey ? importanceKey.split(",") : [], q }),
    [importanceKey, q]
  ) as EventFilterState;

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

  const changeFilter = useCallback(
    (patch: Partial<EventFilterState>) => update(patch, "replace"),
    [update]
  );

  return (
    <Box>
      {!hideControls && (
        <>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              aria-label={uk.views.label}
              onChange={(_, next: ViewState["view"] | null) => {
                if (next) update({ view: next }, "push");
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
                  // Leaving the month grid: land on today rather than the 1st.
                  const anchor =
                    mode === "month" && next !== "month"
                      ? dateForModeSwitch(
                          date,
                          toLocalParts(new Date().toISOString()).date
                        )
                      : date;
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
          </Box>
          <EventFilterBar value={filter} onChange={changeFilter} />
        </>
      )}
      {view === "calendar" ? (
        <EventCalendar
          initialDate={date ?? undefined}
          mode={mode}
          onDateChange={(next) => update({ date: next }, "replace")}
          filter={filter}
        />
      ) : (
        <EventList filter={filter} />
      )}
    </Box>
  );
}
