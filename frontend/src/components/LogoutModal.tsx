"use client";

import { ConfirmationModal } from "./ConfirmationModal";

type LogoutModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function LogoutModal({ open, onConfirm, onCancel }: LogoutModalProps) {
  return (
    <ConfirmationModal
      open={open}
      message="Are you sure you want to log out?"
      confirmLabel="Log out"
      ariaLabel="Confirm logout"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
