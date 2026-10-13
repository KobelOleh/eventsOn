// The Owner's Filter (Importance levels + Keyword search) as read from and
// written to the URL. Pure and client-safe: no Next, no server code.

import { IMPORTANCES, MAX_SEARCH_LENGTH, type Importance } from "./constants";

/** Same shape the list and range actions accept. */
export type EventFilterState = { importance: Importance[]; q: string };

export const UNFILTERED: EventFilterState = { importance: [], q: "" };

export type SearchParamsLike = { get(name: string): string | null };

/** The one place a Filter is normalised, for the URL and the server alike:
 *  unique known Importance levels in canonical order, and a trimmed search cut
 *  to MAX_SEARCH_LENGTH. Never fails; the server schema rejects over-long
 *  input before it gets here, the URL parser relies on the cut. */
export function normaliseFilter(raw: {
  importance?: readonly string[];
  q?: string;
}): EventFilterState {
  const selected = raw.importance ?? [];
  return {
    importance: IMPORTANCES.filter((level) => selected.includes(level)),
    q: (raw.q ?? "").trim().slice(0, MAX_SEARCH_LENGTH).trimEnd(),
  };
}

/** Reads the Filter from URL params; anything unusable falls back to
 *  Unfiltered parts. */
export function parseFilter(
  params: SearchParamsLike | string
): EventFilterState {
  const source =
    typeof params === "string" ? new URLSearchParams(params) : params;
  return normaliseFilter({
    importance: (source.get("importance") ?? "").split(","),
    q: source.get("q") ?? "",
  });
}

/** The query string (without "?") with `filter` written over `into`'s Filter
 *  params; other params are kept, and Unfiltered writes no Filter params. */
export function writeFilter(
  filter: EventFilterState,
  into: URLSearchParams | string = ""
): string {
  const next = new URLSearchParams(into);
  if (filter.importance.length === 0) next.delete("importance");
  else next.set("importance", filter.importance.join(","));
  if (filter.q === "") next.delete("q");
  else next.set("q", filter.q);
  return next.toString();
}

export function filterEquals(a: EventFilterState, b: EventFilterState) {
  return (
    a.q === b.q &&
    a.importance.length === b.importance.length &&
    a.importance.every((level, i) => level === b.importance[i])
  );
}

/** True when the Filter hides some Events (it is not Unfiltered). */
export function isNarrowing(filter: EventFilterState) {
  return !filterEquals(filter, UNFILTERED);
}
