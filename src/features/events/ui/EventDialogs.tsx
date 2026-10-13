"use client";

import { createEvent, deleteEvent, updateEvent } from "../actions";
import { toLocalParts } from "../lib/datetime";
import type { EventDto } from "../lib/event-service";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { EventDialog, type EventFormValues } from "./EventDialog";
import { uk } from "@/shared/i18n/uk";

export type DialogState = {
  key: number;
  values: EventFormValues;
  /** Set when editing an existing Event. */
  editing?: EventDto;
  confirmingDelete?: boolean;
} | null;

/** Dialog state for editing `event` (`key` must be fresh per opening). */
export function editingDialog(event: EventDto, key: number): DialogState {
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

/** Create/edit dialog plus delete confirmation, shared by both views. */
export function EventDialogs({ dialog, onChange, onChanged }: Props) {
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
