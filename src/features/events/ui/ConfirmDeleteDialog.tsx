"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";
import { uk } from "@/shared/i18n/uk";

type Props = {
  title: string;
  onCancel: () => void;
  /** Resolves true when the Event is gone (deleted or already missing). */
  onConfirm: () => Promise<boolean>;
};

/** Separate confirmation step: deletion is permanent. */
export function ConfirmDeleteDialog({ title, onCancel, onConfirm }: Props) {
  const t = uk.eventEdit;
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function confirm() {
    setPending(true);
    setFailed(false);
    const done = await onConfirm().catch(() => false);
    if (!done) {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <Dialog open onClose={pending ? undefined : onCancel}>
      <DialogTitle>{t.deleteConfirmTitle}</DialogTitle>
      <DialogContent>
        {failed && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t.deleteFailed}
          </Alert>
        )}
        <DialogContentText>
          {title}. {t.deleteConfirmText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={pending} autoFocus>
          {t.deleteCancel}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => void confirm()}
          disabled={pending}
        >
          {t.deleteConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
