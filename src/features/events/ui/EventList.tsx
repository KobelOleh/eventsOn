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
import type { EventDto } from "../lib/event-service";
import type { EventFilterState } from "../lib/event-filter";
import { useRegisterCreateEvent } from "./create-event";
import {
  creatingDialog,
  editingDialog,
  EventDialogs,
  type DialogState,
} from "./EventDialogs";
import { deriveFilterKeys, toFilterQuery } from "./filter-keys";
import { EventListItem } from "./EventListItem";
import { EventListSkeleton } from "./skeletons";

type Props = {
  /** Importance filter and search; a change reloads from the first page. */
  filter?: EventFilterState;
};

/** The Owner's Events as a paged list, earliest first, 20 at a time.
 *  Clicking a row opens the edit dialog; the list reloads after a change. */
export function EventList({ filter }: Props) {
  const { importanceKey, searchText, isFiltered } = deriveFilterKeys(filter);

  const [items, setItems] = useState<EventDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // first page, initially
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);
  const dialogCount = useRef(0);
  // Bumped whenever the list is (re)started; older responses are dropped.
  const generation = useRef(0);

  const query = useCallback(
    (cursor: string | null) => ({
      ...(cursor && { cursor }),
      ...toFilterQuery({ importanceKey, searchText }),
    }),
    [importanceKey, searchText]
  );

  /** Loads the first page, replacing the list. */
  const reload = useCallback(
    async (showSpinner: boolean) => {
      const mine = ++generation.current;
      if (showSpinner) setLoading(true);
      setFailed(false);
      setLoadingMore(false);
      const result = await listEvents(query(null)).catch(() => null);
      if (mine !== generation.current) return;
      if (result?.ok) {
        setItems(result.data.items);
        setNextCursor(result.data.nextCursor);
      } else {
        if (showSpinner) setItems([]);
        setNextCursor(null);
        setFailed(true);
      }
      setLoading(false);
    },
    [query]
  );

  useEffect(() => {
    void Promise.resolve().then(() => reload(true));
  }, [reload]);

  const showMore = async () => {
    if (loadingMore || nextCursor === null) return;
    const mine = generation.current;
    setLoadingMore(true);
    setFailed(false);
    const result = await listEvents(query(nextCursor)).catch(() => null);
    if (mine !== generation.current) return;
    if (result?.ok) {
      setItems((prev) => [...prev, ...result.data.items]);
      setNextCursor(result.data.nextCursor);
    } else {
      setFailed(true);
    }
    setLoadingMore(false);
  };

  useRegisterCreateEvent(
    useCallback(() => {
      dialogCount.current += 1;
      setDialog(creatingDialog(dialogCount.current));
    }, [])
  );

  const dialogs = (
    <EventDialogs
      dialog={dialog}
      onChange={setDialog}
      onChanged={() => void reload(false)}
    />
  );

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
            <Button onClick={() => void reload(true)}>{uk.list.retry}</Button>
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
            {isFiltered ? uk.filters.noMatches : uk.list.empty}
          </Typography>
        </Paper>
        {dialogs}
      </>
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
              onSelect={(selected) => {
                dialogCount.current += 1;
                setDialog(editingDialog(selected, dialogCount.current));
              }}
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
