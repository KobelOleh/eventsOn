// URL search-param state of the events screen. Pure and client-safe.
// Unknown params are always preserved.

import { IMPORTANCES, type Importance } from "./schemas";

export const VIEWS = ["calendar", "list"] as const;
export type View = (typeof VIEWS)[number];
export const DEFAULT_VIEW: View = "calendar";

export type ViewState = {
  view: View;
  /** Browser-local "yyyy-mm-dd" the calendar is anchored on; null = today. */
  date: string | null;
  /** Selected Importance levels (comma-separated in the URL); [] = all. */
  importance: Importance[];
  /** Search text; "" = no search. */
  q: string;
};

/** The filter part of the state, as passed to both views. */
export type EventFilterState = Pick<ViewState, "importance" | "q">;

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
  const date = params.get("date");
  const selected = (params.get("importance") ?? "").split(",");
  return {
    view: VIEWS.find((v) => v === view) ?? DEFAULT_VIEW,
    date: date !== null && isRealDate(date) ? date : null,
    importance: IMPORTANCES.filter((level) => selected.includes(level)),
    q: params.get("q") ?? "",
  };
}

/** The query string (without "?") after applying `patch` to `current`.
 *  `view` is always written explicitly so the URL reflects the screen. */
export function withViewState(
  current: URLSearchParams | string,
  patch: Partial<ViewState>
): string {
  const next = new URLSearchParams(current);
  if (patch.view !== undefined) next.set("view", patch.view);
  if (patch.date !== undefined) {
    if (patch.date === null) next.delete("date");
    else next.set("date", patch.date);
  }
  if (patch.importance !== undefined) {
    if (patch.importance.length === 0) next.delete("importance");
    else next.set("importance", patch.importance.join(","));
  }
  if (patch.q !== undefined) {
    if (patch.q === "") next.delete("q");
    else next.set("q", patch.q);
  }
  return next.toString();
}
