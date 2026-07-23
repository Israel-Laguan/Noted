"use client";

import { useParams } from "next/navigation";
import { formatLastEdited } from "@/lib/dates";
import Close from "@/assets/svgs/close.svg";
import Delete from "@/assets/svgs/delete.svg";
import { CategorySelect } from "./CategorySelect";
import { DeleteNoteModal } from "./DeleteNoteModal";
import { useNoteEditor } from "./useNoteEditor";
import type { Category } from "@/lib/types";
import type { SaveStatus } from "./useNoteEditor";

function LoadingState() {
  return (
    <div
      className="flex min-h-screen items-center justify-center gap-3 text-[13px] text-muted"
      role="status"
    >
      <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
      Opening your note…
    </div>
  );
}

function ErrorState({ error, onGoBack }: { error: string; onGoBack: () => void }) {
  return (
    <main className="grid min-h-screen place-content-center justify-items-center p-6 text-center">
      <div className="text-[62px] text-accent" aria-hidden="true">
        ✎
      </div>
      <h1 className="mb-1 mt-3 font-serif text-3xl font-medium">That note is unavailable.</h1>
      <p className="mb-5 max-w-[420px] text-muted" role="alert">
        {error}
      </p>
      <button
        className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-accent bg-accent px-[22px] text-sm font-bold text-cream"
        onClick={onGoBack}
      >
        Back to notes
      </button>
    </main>
  );
}

function EditorHeader({
  categories,
  category,
  onCategoryChange,
  status,
  disabled,
  onDelete,
  onClose,
  showDelete,
}: {
  categories: Category[];
  category: number;
  onCategoryChange: (id: number) => void;
  status: SaveStatus;
  disabled: boolean;
  onDelete: () => void;
  onClose: () => void;
  showDelete: boolean;
}) {
  return (
    <header className="mb-3.5 flex min-h-12 items-center gap-3 max-sm:gap-[5px]">
      <CategorySelect
        categories={categories}
        value={category}
        onChange={onCategoryChange}
        disabled={disabled}
      />
      <span
        className={`text-[11px] ${status === "error" ? "text-danger" : status === "saved" ? "text-success" : "text-muted"}`}
      >
        {status === "saving"
          ? "Saving…"
          : status === "saved"
            ? "Saved"
            : status === "error"
              ? "Save failed"
              : ""}
      </span>
      <div className="flex-1" />
      {showDelete && (
        <button
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent hover:bg-danger/10"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Delete note"
          title="Delete note"
        >
          <Delete className="h-6 w-6 text-ink/70 hover:text-danger" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent"
        onClick={onClose}
        disabled={disabled}
        aria-label="Close note"
      >
        <Close className="h-6 w-6" aria-hidden="true" />
      </button>
    </header>
  );
}

function EditorContent({
  selectedCategory,
  updatedAt,
  title,
  onTitleChange,
  content,
  onContentChange,
  disabled,
}: {
  selectedCategory: Category | undefined;
  updatedAt: string;
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <article
      className="flex flex-col flex-1 rounded-[11px] border px-[72px] py-[40px] max-sm:px-6 max-sm:py-[30px]"
      style={{
        backgroundColor: `${selectedCategory?.color ?? "#EF9C66"}88`,
        borderColor: selectedCategory?.color ?? "#EF9C66",
        borderWidth: 3,
      }}
    >
      <p className="mb-6 self-end text-[10px] text-ink/70">
        <time dateTime={updatedAt}>{formatLastEdited(updatedAt)}</time>
      </p>
      <input
        className="w-full border-0 bg-transparent p-0 outline-none text-black text-[24px] font-serif font-bold  placeholder-black/50"
        aria-label="Note title"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Note Title"
        maxLength={160}
        autoFocus
        disabled={disabled}
      />
      <textarea
        className="mt-[22px] min-h-[300px] w-full flex-1 border-0 bg-transparent p-0 font-inter text-[16px] outline-none placeholder-black/50"
        aria-label="Note content"
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        placeholder="Pour your heart out…"
        disabled={disabled}
      />
    </article>
  );
}

export function NoteEditor() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const {
    categories,
    category,
    setCategory,
    title,
    setTitle,
    content,
    setContent,
    updatedAt,
    status,
    ready,
    closing,
    error,
    showDeleteModal,
    setShowDeleteModal,
    markEdited,
    closeEditor,
    confirmDelete,
    remove,
    goBack,
  } = useNoteEditor(id);

  const selectedCategory = categories.find((item) => item.id === category);

  if (!ready && !error) return <LoadingState />;
  if (!ready) return <ErrorState error={error} onGoBack={goBack} />;

  return (
    <main className="flex flex-col min-h-screen pb-12 pt-8 px-10">
      <EditorHeader
        categories={categories}
        category={category}
        onCategoryChange={(categoryId) => {
          setCategory(categoryId);
          markEdited();
        }}
        status={status}
        disabled={closing}
        onDelete={remove}
        onClose={closeEditor}
        showDelete={true}
      />
      <DeleteNoteModal
        open={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      {error && (
        <div
          className="mb-3 rounded-[9px] bg-error-surface px-3 py-2.5 text-xs text-error-text"
          role="alert"
        >
          {error}
        </div>
      )}
      <EditorContent
        selectedCategory={selectedCategory}
        updatedAt={updatedAt}
        title={title}
        onTitleChange={(value) => {
          setTitle(value);
          markEdited();
        }}
        content={content}
        onContentChange={(value) => {
          setContent(value);
          markEdited();
        }}
        disabled={closing}
      />
    </main>
  );
}
