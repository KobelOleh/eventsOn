// URL search-param state of the events screen. Pure and client-safe.
// Unknown params are always preserved.

import {
  parseFilter,
  type SearchParamsLike,
  writeFilter,
  type EventFilterState,
} from "./event-filter";

export const VIEWS = ["calendar", "list"] as const;
export type View = (typeof VIEWS)[number];
export const DEFAULT_VIEW: View = "calendar";

export const MODES = ["month", "week", "day"] as const;
export type CalendarMode = (typeof MODES)[number];
export const DEFAULT_MODE: CalendarMode = "month";

export type ViewState = {
  view: View;
  /** Calendar granularity (month/week/day); ignored by the list view. */
  mode: CalendarMode;
  /** Browser-local "yyyy-mm-dd" the calendar is anchored on; null = today. */
  date: string | null;
  /** The Owner's Filter, shared by both views. */
  filter: EventFilterState;
};

/** What the workspace executes: the new query string (without "?") and
 *  whether it gets its own history entry. */
export type Transition = { search: string; history: "push" | "replace" };

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y = 0, m = 0, d = 0] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y &&
    parsed.getUTCMonth() === m - 1 &&
    parsed.getUTCDate() === d
  );
}

/** Invalid or missing values fall back to defaults instead of failing. */
export function parseViewState(params: SearchParamsLike): ViewState {
  const view = params.get("view");
  const mode = params.get("mode");
  const date = params.get("date");
  return {
    view: VIEWS.find((v) => v === view) ?? DEFAULT_VIEW,
    mode: MODES.find((m) => m === mode) ?? DEFAULT_MODE,
    date: date !== null && isRealDate(date) ? date : null,
    filter: parseFilter(params),
  };
}

type Search = URLSearchParams | string;

/** Writes `view` explicitly so the URL reflects the screen. */
function withView(search: Search, view: View) {
  const next = new URLSearchParams(search);
  next.set("view", view);
  return next;
}

/** Switching view starts a new history entry. */
export function switchView(search: Search, view: View): Transition {
  return { search: withView(search, view).toString(), history: "push" };
}

/** Switching mode starts a new history entry. Leaving the month grid lands on
 *  today if the shown month is the current one (the anchor is only its first
 *  day), else keeps the anchor. `today` is a "yyyy-mm-dd" string. */
export function switchMode(
  search: Search,
  mode: CalendarMode,
  today: string
): Transition {
  const current = parseViewState(new URLSearchParams(search));
  const next = withView(search, current.view);
  if (mode === DEFAULT_MODE) next.delete("mode");
  else next.set("mode", mode);
  if (current.mode === "month" && mode !== "month") {
    const { date } = current;
    const landing =
      date === null || date.slice(0, 7) === today.slice(0, 7) ? today : date;
    next.set("date", landing);
  }
  return { search: next.toString(), history: "push" };
}

/** Replaces the history entry; null when `date` is already shown. */
export function navigateToDate(
  search: Search,
  date: string
): Transition | null {
  const current = parseViewState(new URLSearchParams(search));
  if (current.date === date) return null;
  const next = withView(search, current.view);
  next.set("date", date);
  return { search: next.toString(), history: "replace" };
}

/** Replaces the history entry; view, mode and date are left alone. */
export function changeFilter(
  search: Search,
  patch: Partial<EventFilterState>
): Transition {
  const current = parseViewState(new URLSearchParams(search));
  const next = withView(search, current.view);
  return {
    search: writeFilter({ ...current.filter, ...patch }, next),
    history: "replace",
  };
}
