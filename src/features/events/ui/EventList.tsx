"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { uk } from "@/shared/i18n/uk";
import { listEvents } from "../actions";
import type { EventDto } from "../lib/event-dto";
import { isNarrowing, type EventFilterState } from "../lib/event-filter";
import { useEventDialogs } from "./EventDialogs";
import { EventListItem } from "./EventListItem";
import { EventListSkeleton } from "./skeletons";
import { useLatestRequest } from "./use-latest-request";

type Props = {
  /** Importance filter and search; a change reloads from the first page. */
  filter: EventFilterState;
};

/** How a reload shows: "initial" replaces the list with a skeleton, "filter"
 *  keeps the rows on screen (dimmed) until the new Filter's rows arrive, so
 *  typing in the search does not make the page jump, and "silent" refreshes
 *  after a change without any indicator. */
type ReloadMode = "initial" | "filter" | "silent";

/** The Owner's Events as a paged list, earliest first, 20 at a time.
 *  Clicking a row opens the edit dialog; the list reloads after a change. */
export function EventList({ filter }: Props) {
  const [items, setItems] = useState<EventDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // first page, initially
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnce = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
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
      if (mode === "initial") setLoading(true);
      if (mode === "filter") setRefreshing(true);
      setFailed(false);
      setLoadingMore(false);
      const result = await listEvents(query(null)).catch(() => null);
      if (!isCurrent()) return;
      if (result?.ok) {
        setItems(result.data.items);
        setNextCursor(result.data.nextCursor);
      } else {
        // Rows of an older Filter must not stand beside the error.
        if (mode !== "silent") setItems([]);
        setNextCursor(null);
        setFailed(true);
      }
      loadedOnce.current = true;
      setLoading(false);
      setRefreshing(false);
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
    setLoadingMore(true);
    setFailed(false);
    const result = await listEvents(query(nextCursor)).catch(() => null);
    if (!isCurrent()) return;
    if (result?.ok) {
      setItems((prev) => [...prev, ...result.data.items]);
      setNextCursor(result.data.nextCursor);
    } else {
      setFailed(true);
    }
    setLoadingMore(false);
  };

  const { openEdit, dialogs } = useEventDialogs(() => void reload("silent"));

  if (loading) {
    return (
      <>
        <EventListSkeleton />
        {dialogs}
      </>
    );
  }

  if (items.length === 0 && failed) {
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

  if (items.length === 0) {
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
