// URL search-param state of the events screen. Pure and client-safe.
// Unknown params are always preserved.

import {
  parseFilter,
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

/** A change to the view state; `filter` may be partial. */
export type ViewStatePatch = Partial<Omit<ViewState, "filter">> & {
  filter?: Partial<EventFilterState>;
};

type SearchParamsLike = { get(name: string): string | null };

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

/** The query string (without "?") after applying `patch` to `current`.
 *  `view` is always written explicitly so the URL reflects the screen. */
export function withViewState(
  current: URLSearchParams | string,
  patch: ViewStatePatch
): string {
  const next = new URLSearchParams(current);
  if (patch.view !== undefined) next.set("view", patch.view);
  if (patch.mode !== undefined) {
    if (patch.mode === DEFAULT_MODE) next.delete("mode");
    else next.set("mode", patch.mode);
  }
  if (patch.date !== undefined) {
    if (patch.date === null) next.delete("date");
    else next.set("date", patch.date);
  }
  if (patch.filter !== undefined) {
    return writeFilter({ ...parseFilter(next), ...patch.filter }, next);
  }
  return next.toString();
}

/** The date to anchor week/day on when leaving the month grid: today if the
 *  shown month is the current one (the anchor is only its first day), else
 *  the anchor itself. Both are "yyyy-mm-dd"; null anchor = today. */
export function dateForModeSwitch(anchor: string | null, today: string) {
  if (anchor === null || anchor.slice(0, 7) === today.slice(0, 7)) return today;
  return anchor;
}
