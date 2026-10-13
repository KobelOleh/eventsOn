"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import FullCalendar, {
  type CalendarRef,
  type DateClickInfo,
  type DatesSetInfo,
  type EventClickInfo,
  type EventInput,
  type EventSourceFuncInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import ukLocale from "@fullcalendar/react/locales/uk";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { useCallback, useEffect, useRef, useState } from "react";
import { uk } from "@/shared/i18n/uk";
import { listEventsInRange } from "../actions";
import { clickedDateParts, toLocalParts } from "../lib/datetime";
import type { EventDto } from "../lib/event-service";
import {
  isNarrowing,
  UNFILTERED,
  type EventFilterState,
} from "../lib/event-filter";
import type { CalendarMode } from "../lib/view-state";
import { useRegisterCreateEvent } from "./create-event";
import {
  creatingDialog,
  editingDialog,
  EventDialogs,
  type DialogState,
} from "./EventDialogs";
import { presentationOf } from "./importance";
import { CalendarGridSkeleton } from "./skeletons";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

const plugins = [
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
  classicThemePlugin,
];

const VIEW_NAMES: Record<CalendarMode, string> = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
};

function toCalendarEvent(event: EventDto): EventInput {
  const { color, textColor } = presentationOf(event.importance);
  return {
    id: event.id,
    title: event.title,
    start: event.startsAt,
    extendedProps: { dto: event },
    color,
    contrastColor: textColor,
  };
}

type CalendarProps = {
  /** "yyyy-mm-dd" to open on (from the URL); defaults to today. */
  initialDate?: string;
  /** Month, week or day grid (from the URL). */
  mode?: CalendarMode;
  /** Reports the first day of the range shown after navigating. */
  onDateChange?: (date: string) => void;
  /** Importance filter and search; a change refetches the visible range. */
  filter: EventFilterState;
};

/** Month/week/day calendar of the Owner's Events with a create dialog. */
export function EventCalendar({
  initialDate,
  mode = "month",
  onDateChange,
  filter,
}: CalendarProps) {
  // The first datesSet is the initial render, not a navigation.
  const lastReported = useRef<string | null>(null);
  const handleDatesSet = useCallback(
    (info: DatesSetInfo) => {
      const { date } = toLocalParts(info.view.currentStart.toISOString());
      const first = lastReported.current === null;
      if (date === lastReported.current) return;
      lastReported.current = date;
      if (!first) onDateChange?.(date);
    },
    [onDateChange]
  );
  // FullCalendar renders only after this component has committed: it starts
  // fetching during its own render and the fetch updates our state.
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(id);
  }, []);
  const calendarRef = useRef<CalendarRef>(null);
  // Server Actions run one at a time; only the newest request may win.
  const latestRequest = useRef(0);
  const dialogCount = useRef(0);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState<number | null>(null);

  // A mode change in the URL (switcher or browser Back) switches the grid.
  // The date comes via a ref so only the mode triggers the switch.
  const dateRef = useRef(initialDate);
  useEffect(() => {
    dateRef.current = initialDate;
  }, [initialDate]);
  const shownMode = useRef(mode);
  useEffect(() => {
    if (shownMode.current === mode) return;
    shownMode.current = mode;
    calendarRef.current?.getApi().changeView(VIEW_NAMES[mode], dateRef.current);
  }, [mode]);

  // The callback reads the filter from a ref so its identity never changes
  // (a changing `events` function made FullCalendar refetch in a loop);
  // a filter change refetches explicitly in the effect below.
  // Null until the first effect; FullCalendar mounts after that.
  const filterRef = useRef<EventFilterState | null>(null);
  useEffect(() => {
    const previous = filterRef.current;
    filterRef.current = filter;
    if (previous) calendarRef.current?.getApi().refetchEvents();
  }, [filter]);

  // Must keep a stable identity, or FullCalendar refetches on every render.
  const loadEvents = useCallback(
    async (info: EventSourceFuncInfo): Promise<EventInput[]> => {
      const request = ++latestRequest.current;
      // FullCalendar may call this during its render; calling a Server Action
      // or setting state there updates the Router mid-render. Defer a tick.
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (request !== latestRequest.current) return [];
      setLoading(true);
      const result = await listEventsInRange({
        start: info.startStr,
        end: info.endStr,
        ...(filterRef.current ?? UNFILTERED),
      }).catch(() => null);
      if (request !== latestRequest.current) return []; // stale response
      // Past the await we are no longer in FullCalendar's render phase.
      setLoadFailed(!result?.ok);
      setLoadedCount(result?.ok ? result.data.length : null);
      setLoading(false);
      return result?.ok ? result.data.map(toCalendarEvent) : [];
    },
    []
  );

  const handleDateClick = useCallback((info: DateClickInfo) => {
    dialogCount.current += 1;
    const { date, time } = clickedDateParts(info.dateStr);
    setDialog(creatingDialog(dialogCount.current, date, time));
  }, []);

  useRegisterCreateEvent(
    useCallback(() => {
      dialogCount.current += 1;
      setDialog(creatingDialog(dialogCount.current));
    }, [])
  );

  const handleEventClick = useCallback((info: EventClickInfo) => {
    dialogCount.current += 1;
    setDialog(
      editingDialog(
        info.event.extendedProps.dto as EventDto,
        dialogCount.current
      )
    );
  }, []);

  const isEmpty = !loading && !loadFailed && loadedCount === 0;
  const emptyMessage = isEmpty
    ? isNarrowing(filter)
      ? uk.filters.noMatches
      : uk.events.emptyRange
    : null;

  const refresh = () => calendarRef.current?.getApi().refetchEvents();

  return (
    <Box aria-label={uk.events.calendarLabel}>
      {loadFailed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uk.events.loadFailed}
        </Alert>
      )}
      <Box
        role="status"
        aria-label={loading ? uk.events.loading : undefined}
        sx={{ height: 4, mb: 1 }}
      >
        {loading && <LinearProgress />}
      </Box>
      {/* Dates are formatted by the browser's ICU; the server's output differs
          slightly, so the grid is rendered on the client only. */}
      {isClient ? (
        <Box
          // Day/time cells open the create dialog and events open the edit
          // dialog, so the whole grid reads as clickable (headers excepted).
          sx={{
            cursor: "pointer",
            "& [role='columnheader'], & th": { cursor: "default" },
          }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={plugins}
            locale={ukLocale}
            initialView={VIEW_NAMES[mode]}
            initialDate={initialDate}
            datesSet={handleDatesSet}
            headerToolbar={{ start: "title", end: "today prev,next" }}
            height="auto"
            events={loadEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
          />
        </Box>
      ) : (
        <CalendarGridSkeleton />
      )}
      {/* The line is always reserved so the empty message cannot push the
          page down when a range loads with no Events. */}
      <Typography
        color="text.secondary"
        sx={{ mt: 2, minHeight: 24, textAlign: "center" }}
      >
        {emptyMessage}
      </Typography>
      <EventDialogs dialog={dialog} onChange={setDialog} onChanged={refresh} />
    </Box>
  );
}
