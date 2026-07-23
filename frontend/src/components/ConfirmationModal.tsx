"use client";

import { useEffect, useRef } from "react";

type ConfirmationModalProps = {
  open: boolean;
  message: string;
  confirmLabel: string;
  ariaLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  open,
  message,
  confirmLabel,
  ariaLabel,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
    } else if (previousFocus.current) {
      previousFocus.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="mx-4 w-full max-w-sm rounded-[13px] border border-line bg-white p-6 shadow-lg outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-6 text-center text-[16px] font-bold text-line">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            className="flex h-[42px] cursor-pointer items-center justify-center rounded-full border border-line px-6 text-[14px] font-bold text-line hover:bg-line/20"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex h-[42px] cursor-pointer items-center justify-center rounded-full bg-error-text px-6 text-[14px] font-bold text-white hover:opacity-90"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
