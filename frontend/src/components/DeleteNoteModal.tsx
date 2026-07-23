"use client";

type DeleteNoteModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteNoteModal({ open, onConfirm, onCancel }: DeleteNoteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete note"
    >
      <div
        className="mx-4 w-full max-w-sm rounded-[13px] border border-line bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-6 text-center text-[16px] font-bold text-line">
          Are you sure you want to delete this note? This cannot be undone.
        </p>
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
