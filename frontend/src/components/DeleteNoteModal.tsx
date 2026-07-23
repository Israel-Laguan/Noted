"use client";

import { ConfirmationModal } from "./ConfirmationModal";

type DeleteNoteModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteNoteModal({ open, onConfirm, onCancel }: DeleteNoteModalProps) {
  return (
    <ConfirmationModal
      open={open}
      message="Are you sure you want to delete this note? This cannot be undone."
      confirmLabel="Delete"
      ariaLabel="Confirm delete note"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
