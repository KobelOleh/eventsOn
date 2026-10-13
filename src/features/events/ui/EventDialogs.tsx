"use client";

import { useCallback, useRef, useState } from "react";
import { createEvent, deleteEvent, updateEvent } from "../actions";
import { DEFAULT_TIME, toLocalParts } from "../lib/datetime";
import type { EventDto } from "../lib/event-dto";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { useRegisterCreateEvent } from "./create-event";
import { EventDialog, type EventFormValues } from "./EventDialog";
import { uk } from "@/shared/i18n/uk";

type DialogState = {
  key: number;
  values: EventFormValues;
  /** Set when editing an existing Event. */
  editing?: EventDto;
  confirmingDelete?: boolean;
} | null;

/** Dialog state for a new Event on `date` ("yyyy-mm-dd", default today) at
 *  `time` (default 09:00). */
function creatingDialog(
  key: number,
  date: string = toLocalParts(new Date().toISOString()).date,
  time: string = DEFAULT_TIME
): DialogState {
  return {
    key,
    values: { title: "", description: "", date, time, importance: "NORMAL" },
  };
}

/** Dialog state for editing `event` (`key` must be fresh per opening). */
function editingDialog(event: EventDto, key: number): DialogState {
  const { date, time } = toLocalParts(event.startsAt);
  return {
    key,
    editing: event,
    values: {
      title: event.title,
      description: event.description,
      date,
      time,
      importance: event.importance,
    },
  };
}

type Props = {
  dialog: DialogState;
  onChange: (next: DialogState) => void;
  /** An Event was created, saved or deleted: refresh the view. */
  onChanged: () => void;
};

/** Create/edit dialog plus delete confirmation. */
function EventDialogs({ dialog, onChange, onChanged }: Props) {
  return (
    <>
      {dialog && (
        <EventDialog
          key={dialog.key}
          open
          heading={
            dialog.editing ? uk.eventEdit.editTitle : uk.events.createTitle
          }
          initialValues={dialog.values}
          onClose={() => onChange(null)}
          onSubmit={(payload) =>
            dialog.editing
              ? updateEvent(dialog.editing.id, payload)
              : createEvent(payload)
          }
          onSaved={() => {
            onChange(null);
            onChanged();
          }}
          onDelete={
            dialog.editing
              ? () => onChange({ ...dialog, confirmingDelete: true })
              : undefined
          }
        />
      )}
      {dialog?.editing && dialog.confirmingDelete && (
        <ConfirmDeleteDialog
          title={dialog.editing.title}
          onCancel={() => onChange({ ...dialog, confirmingDelete: false })}
          onConfirm={async () => {
            const result = await deleteEvent(dialog.editing!.id);
            // Already gone elsewhere counts as deleted: the view must refresh.
            const gone = result.ok || result.error.code === "NOT_FOUND";
            if (gone) {
              onChange(null);
              onChanged();
            }
            return gone;
          }}
        />
      )}
    </>
  );
}

/** Dialog state shared by both views. `openCreate` defaults to today at
 *  09:00; `dialogs` is the element to render; `onChanged` runs after an
 *  Event is created, saved or deleted. Also serves the header's create button. */
export function useEventDialogs(onChanged: () => void) {
  const count = useRef(0);
  const [dialog, setDialog] = useState<DialogState>(null);

  const openCreate = useCallback((date?: string, time?: string) => {
    count.current += 1;
    setDialog(creatingDialog(count.current, date, time));
  }, []);

  const openEdit = useCallback((event: EventDto) => {
    count.current += 1;
    setDialog(editingDialog(event, count.current));
  }, []);

  useRegisterCreateEvent(useCallback(() => openCreate(), [openCreate]));

  const dialogs = (
    <EventDialogs dialog={dialog} onChange={setDialog} onChanged={onChanged} />
  );
  return { openCreate, openEdit, dialogs };
}
