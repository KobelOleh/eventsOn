"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { uk } from "@/shared/i18n/uk";
import { listEvents } from "../actions";
import type { EventDto } from "../lib/event-service";
import { EventListItem } from "./EventListItem";

type Props = {
  /** Called when a row is clicked (wired to edit by a later ticket). */
  onSelectEvent?: (event: EventDto) => void;
};

/** The Owner's Events as a paged list, earliest first, 20 at a time. */
export function EventList({ onSelectEvent }: Props) {
  const [items, setItems] = useState<EventDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // first page, initially
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false); // ignore double clicks while a page is loading

  const loadPage = useCallback(async (cursor: string | null) => {
    if (busy.current) return;
    busy.current = true;
    const result = await listEvents(cursor ? { cursor } : {}).catch(() => null);
    busy.current = false;
    if (result?.ok) {
      setItems((prev) => [...prev, ...result.data.items]);
      setNextCursor(result.data.nextCursor);
      setFailed(false);
    } else {
      setFailed(true);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    // The ref guard also makes React strict-mode's double effect harmless.
    void Promise.resolve().then(() => loadPage(null));
  }, [loadPage]);

  const showMore = () => {
    setLoadingMore(true);
    setFailed(false);
    void loadPage(nextCursor);
  };

  const retryFirstPage = () => {
    setLoading(true);
    setFailed(false);
    void loadPage(null);
  };

  if (loading) {
    return (
      <Box
        role="status"
        aria-label={uk.list.loading}
        sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
      >
        <CircularProgress size={24} />
        <Typography color="text.secondary">{uk.list.loading}</Typography>
      </Box>
    );
  }

  if (items.length === 0 && failed) {
    return (
      <Alert
        severity="error"
        action={<Button onClick={retryFirstPage}>{uk.list.retry}</Button>}
      >
        {uk.list.loadFailed}
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">{uk.list.empty}</Typography>
      </Paper>
    );
  }

  return (
    <Box aria-label={uk.list.label}>
      <Paper variant="outlined">
        <List disablePadding>
          {items.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onSelect={onSelectEvent}
            />
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
          <Button variant="outlined" onClick={showMore} disabled={loadingMore}>
            {loadingMore ? uk.list.loading : uk.list.showMore}
          </Button>
        </Box>
      )}
    </Box>
  );
}
