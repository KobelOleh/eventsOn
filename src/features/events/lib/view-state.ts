// URL search-param state of the events screen. Pure and client-safe.
// Unknown params (e.g. `importance` and `q`, added by the filter ticket) are
// always preserved, so new filters need no change to this file's callers.

export const VIEWS = ["calendar", "list"] as const;
export type View = (typeof VIEWS)[number];
export const DEFAULT_VIEW: View = "calendar";

export type ViewState = {
  view: View;
  /** Browser-local "yyyy-mm-dd" the calendar is anchored on; null = today. */
  date: string | null;
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
  const date = params.get("date");
  return {
    view: VIEWS.find((v) => v === view) ?? DEFAULT_VIEW,
    date: date !== null && isRealDate(date) ? date : null,
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
  return next.toString();
}
