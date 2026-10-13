"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { uk } from "@/shared/i18n/uk";
import { listEvents } from "../actions";
import {
  feedView,
  initialFeed,
  reduceFeed,
  type ReloadMode,
} from "../lib/event-feed";
import { isNarrowing, type EventFilterState } from "../lib/event-filter";
import { useEventDialogs } from "./EventDialogs";
import { EventListItem } from "./EventListItem";
import { EventListSkeleton } from "./skeletons";
import { useLatestRequest } from "./use-latest-request";

type Props = {
  /** Importance filter and search; a change reloads from the first page. */
  filter: EventFilterState;
};

/** The Owner's Events as a paged list, earliest first, 20 at a time.
 *  Clicking a row opens the edit dialog; the list reloads after a change. */
export function EventList({ filter }: Props) {
  const [feed, dispatch] = useReducer(reduceFeed, initialFeed);
  const { items, nextCursor, refreshing, loadingMore, failed } = feed;
  const loadedOnce = useRef(false);
  // Restarting the list outdates every earlier response.
  const latest = useLatestRequest();

  const query = useCallback(
    (cursor: string | null) => ({
      ...(cursor && { cursor }),
      importance: filter.importance,
      q: filter.q,
    }),
    [filter]
  );

  /** Loads the first page, replacing the list. */
  const reload = useCallback(
    async (mode: ReloadMode) => {
      const isCurrent = latest.start();
      dispatch({ type: "reload", mode });
      const result = await listEvents(query(null)).catch(() => null);
      if (!isCurrent()) return;
      loadedOnce.current = true;
      dispatch(
        result?.ok
          ? { type: "loaded", page: result.data }
          : { type: "loadFailed", mode }
      );
    },
    [query, latest]
  );

  useEffect(() => {
    void Promise.resolve().then(() =>
      reload(loadedOnce.current ? "filter" : "initial")
    );
  }, [reload]);

  const showMore = async () => {
    if (loadingMore || nextCursor === null) return;
    const isCurrent = latest.current();
    dispatch({ type: "more" });
    const result = await listEvents(query(nextCursor)).catch(() => null);
    if (!isCurrent()) return;
    dispatch(
      result?.ok
        ? { type: "moreLoaded", page: result.data }
        : { type: "moreFailed" }
    );
  };

  const { openEdit, dialogs } = useEventDialogs(() => void reload("silent"));

  const view = feedView(feed);

  if (view === "loading") {
    return (
      <>
        <EventListSkeleton />
        {dialogs}
      </>
    );
  }

  if (view === "failed") {
    return (
      <>
        <Alert
          severity="error"
          action={
            <Button onClick={() => void reload("initial")}>
              {uk.list.retry}
            </Button>
          }
        >
          {uk.list.loadFailed}
        </Alert>
        {dialogs}
      </>
    );
  }

  if (view === "empty") {
    return (
      <>
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            {isNarrowing(filter) ? uk.filters.noMatches : uk.list.empty}
          </Typography>
        </Paper>
        {dialogs}
      </>
    );
  }

  return (
    <Box aria-label={uk.list.label} aria-busy={refreshing}>
      {/* overflow hidden: row hover must follow the rounded corners. */}
      <Paper
        variant="outlined"
        sx={{
          overflow: "hidden",
          opacity: refreshing ? 0.55 : 1,
          transition: "opacity 120ms",
        }}
      >
        <List disablePadding>
          {items.map((event) => (
            <EventListItem key={event.id} event={event} onSelect={openEdit} />
          ))}
        </List>
      </Paper>
      {failed && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {uk.list.loadFailed}
        </Alert>
      )}
      {nextCursor !== null && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => void showMore()}
            loading={loadingMore}
          >
            {uk.list.showMore}
          </Button>
        </Box>
      )}
      {dialogs}
    </Box>
  );
}
