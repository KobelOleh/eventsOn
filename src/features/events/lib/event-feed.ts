// State of the List view's paged feed, as a pure reducer so its transitions
// are testable without React. Which response may be applied (latest request
// wins) is decided by the caller before it dispatches. Client-safe.

import type { EventDto, EventPage } from "./event-dto";

/** How a reload shows: "initial" replaces the list with a skeleton, "filter"
 *  keeps the rows on screen (dimmed) until the new Filter's rows arrive, and
 *  "silent" refreshes after a change without any indicator. */
export type ReloadMode = "initial" | "filter" | "silent";

export type FeedState = {
  items: EventDto[];
  nextCursor: string | null;
  /** First page of the first load: shown as a skeleton. */
  loading: boolean;
  /** A Filter change is loading; the old rows stay, dimmed. */
  refreshing: boolean;
  loadingMore: boolean;
  /** The last load failed (rows may still be shown beside the error). */
  failed: boolean;
};

export const initialFeed: FeedState = {
  items: [],
  nextCursor: null,
  loading: true,
  refreshing: false,
  loadingMore: false,
  failed: false,
};

export type FeedAction =
  | { type: "reload"; mode: ReloadMode }
  | { type: "loaded"; page: EventPage }
  | { type: "loadFailed"; mode: ReloadMode }
  | { type: "more" }
  | { type: "moreLoaded"; page: EventPage }
  | { type: "moreFailed" };

export function reduceFeed(state: FeedState, action: FeedAction): FeedState {
  switch (action.type) {
    case "reload":
      return {
        ...state,
        loading: action.mode === "initial" ? true : state.loading,
        refreshing: action.mode === "filter" ? true : state.refreshing,
        loadingMore: false,
        failed: false,
      };
    case "loaded":
      return {
        ...state,
        items: action.page.items,
        nextCursor: action.page.nextCursor,
        loading: false,
        refreshing: false,
      };
    case "loadFailed":
      return {
        ...state,
        // Rows of an older Filter must not stand beside the error.
        items: action.mode === "silent" ? state.items : [],
        nextCursor: null,
        failed: true,
        loading: false,
        refreshing: false,
      };
    case "more":
      return { ...state, loadingMore: true, failed: false };
    case "moreLoaded":
      return {
        ...state,
        items: [...state.items, ...action.page.items],
        nextCursor: action.page.nextCursor,
        loadingMore: false,
      };
    case "moreFailed":
      return { ...state, failed: true, loadingMore: false };
  }
}

/** What the List view renders: a skeleton, an error with no rows, the empty
 *  state, or the rows (with any error shown beside them). */
export function feedView(
  state: FeedState
): "loading" | "failed" | "empty" | "rows" {
  if (state.loading) return "loading";
  if (state.items.length > 0) return "rows";
  return state.failed ? "failed" : "empty";
}
