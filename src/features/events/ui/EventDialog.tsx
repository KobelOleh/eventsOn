"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { uk } from "@/shared/i18n/uk";
import type { Result } from "@/shared/result";
import { fromLocalParts } from "../lib/datetime";
import type { EventDto } from "../lib/event-dto";
import { IMPORTANCES, type Importance } from "../lib/constants";
import { presentationOf } from "./importance";

/** What the user edits; date and time are browser-local input values. */
export type EventFormValues = {
  title: string;
  description: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  importance: Importance;
};

/** The wire shape sent to the Server Actions (startsAt is a UTC ISO instant). */
export type EventPayload = {
  title: string;
  description: string;
  startsAt: string;
  importance: Importance;
};

type Props = {
  open: boolean;
  heading: string;
  initialValues: EventFormValues;
  onClose: () => void;
  /** Create or update; the dialog does not know which. */
  onSubmit: (payload: EventPayload) => Promise<Result<EventDto>>;
  onSaved: (saved: EventDto) => void;
  /** Present only when editing: shows a Delete button (confirmation is the caller's). */
  onDelete?: () => void;
};

/**
 * Form dialog shared by create and edit. Mount it with a fresh `key` per
 * opening so the fields start from `initialValues`.
 */
export function EventDialog({
  open,
  heading,
  initialValues,
  onClose,
  onSubmit,
  onSaved,
  onDelete,
}: Props) {
  const t = uk.events;
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof EventFormValues>(
    key: K,
    value: EventFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  async function submit() {
    setPending(true);
    setFormError(null);
    try {
      const result = await onSubmit({
        title: values.title,
        description: values.description,
        startsAt: fromLocalParts(values.date, values.time),
        importance: values.importance,
      });
      if (result.ok) {
        onSaved(result.data);
      } else {
        setFieldErrors(result.error.fieldErrors ?? {});
        if (result.error.code === "NOT_FOUND") {
          setFormError(uk.eventEdit.notFound);
        } else if (!result.error.fieldErrors) {
          setFormError(t.saveFailed);
        }
      }
    } catch {
      setFormError(t.saveFailed);
    } finally {
      setPending(false);
    }
  }

  const dateError = fieldErrors.startsAt?.[0];

  return (
    <Dialog open={open} onClose={pending ? undefined : onClose} fullWidth>
      <DialogTitle>{heading}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2}
          sx={{ pt: 1 }}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
          id="event-form"
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            label={t.fieldTitle}
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title?.[0]}
            required
            autoFocus
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label={t.fieldDate}
              type="date"
              value={values.date}
              onChange={(e) => set("date", e.target.value)}
              error={Boolean(dateError)}
              helperText={dateError}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label={t.fieldTime}
              type="time"
              value={values.time}
              onChange={(e) => set("time", e.target.value)}
              error={Boolean(dateError)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField
            label={t.fieldImportance}
            select
            value={values.importance}
            onChange={(e) => set("importance", e.target.value as Importance)}
            error={Boolean(fieldErrors.importance)}
            helperText={fieldErrors.importance?.[0]}
            fullWidth
          >
            {IMPORTANCES.map((level) => (
              <MenuItem key={level} value={level}>
                {presentationOf(level).label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t.fieldDescription}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description?.[0]}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        {onDelete && (
          <Button
            color="error"
            onClick={onDelete}
            disabled={pending}
            sx={{ mr: "auto" }}
          >
            {uk.eventEdit.delete}
          </Button>
        )}
        <Button onClick={onClose} disabled={pending}>
          {t.cancel}
        </Button>
        <Button
          type="submit"
          form="event-form"
          variant="contained"
          loading={pending}
        >
          {t.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
