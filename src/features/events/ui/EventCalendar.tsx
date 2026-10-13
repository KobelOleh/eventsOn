"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FullCalendar, {
  type CalendarRef,
  type DateClickInfo,
  type DatesSetInfo,
  type EventInput,
  type EventSourceFuncInfo,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import ukLocale from "@fullcalendar/react/locales/uk";
import classicThemePlugin from "@fullcalendar/react/themes/classic";
import { useCallback, useEffect, useRef, useState } from "react";
import { uk } from "@/shared/i18n/uk";
import { createEvent, listEventsInRange } from "../actions";
import { DEFAULT_TIME, toLocalParts } from "../lib/datetime";
import type { EventDto } from "../lib/event-service";
import { EventDialog, type EventFormValues } from "./EventDialog";
import { IMPORTANCE_COLORS } from "./importance";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";

const plugins = [dayGridPlugin, interactionPlugin, classicThemePlugin];

function toCalendarEvent(event: EventDto): EventInput {
  const color = IMPORTANCE_COLORS[event.importance];
  return {
    id: event.id,
    title: event.title,
    start: event.startsAt,
    color,
    contrastColor: "#ffffff",
  };
}

function emptyForm(date: string): EventFormValues {
  return {
    title: "",
    description: "",
    date,
    time: DEFAULT_TIME,
    importance: "NORMAL",
  };
}

type DialogState = { key: number; values: EventFormValues } | null;

type CalendarProps = {
  /** "yyyy-mm-dd" to open on (from the URL); defaults to today. */
  initialDate?: string;
  /** Reports the first day of the month shown after navigating. */
  onDateChange?: (date: string) => void;
};

/** Month calendar of the Owner's Events with a create dialog. */
export function EventCalendar({ initialDate, onDateChange }: CalendarProps) {
  const shownMonth = useRef(
    (initialDate ?? toLocalParts(new Date().toISOString()).date).slice(0, 7)
  );
  const handleDatesSet = useCallback(
    (info: DatesSetInfo) => {
      const { date } = toLocalParts(info.view.currentStart.toISOString());
      if (date.slice(0, 7) === shownMonth.current) return;
      shownMonth.current = date.slice(0, 7);
      onDateChange?.(date);
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

  // Must keep a stable identity, or FullCalendar refetches on every render.
  const loadEvents = useCallback(
    async (info: EventSourceFuncInfo): Promise<EventInput[]> => {
      const request = ++latestRequest.current;
      // FullCalendar may call this during its render; calling a Server Action
      // or setting state there updates the Router mid-render. Defer a tick.
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (request !== latestRequest.current) return [];
      const result = await listEventsInRange({
        start: info.startStr,
        end: info.endStr,
      }).catch(() => null);
      if (request !== latestRequest.current) return []; // stale response
      // Past the await we are no longer in FullCalendar's render phase.
      setLoadFailed(!result?.ok);
      return result?.ok ? result.data.map(toCalendarEvent) : [];
    },
    []
  );

  const handleDateClick = useCallback((info: DateClickInfo) => {
    dialogCount.current += 1;
    setDialog({
      key: dialogCount.current,
      values: emptyForm(info.dateStr.slice(0, 10)),
    });
  }, []);

  return (
    <Box aria-label={uk.events.calendarLabel}>
      {loadFailed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uk.events.loadFailed}
        </Alert>
      )}
      {/* Dates are formatted by the browser's ICU; the server's output differs
          slightly, so the grid is rendered on the client only. */}
      {isClient && (
        <FullCalendar
          ref={calendarRef}
          plugins={plugins}
          locale={ukLocale}
          initialView="dayGridMonth"
          initialDate={initialDate}
          datesSet={handleDatesSet}
          headerToolbar={{ start: "title", end: "today prev,next" }}
          height="auto"
          events={loadEvents}
          dateClick={handleDateClick}
        />
      )}
      {dialog && (
        <EventDialog
          key={dialog.key}
          open
          heading={uk.events.createTitle}
          initialValues={dialog.values}
          onClose={() => setDialog(null)}
          onSubmit={createEvent}
          onSaved={() => {
            setDialog(null);
            calendarRef.current?.getApi().refetchEvents();
          }}
        />
      )}
    </Box>
  );
}
