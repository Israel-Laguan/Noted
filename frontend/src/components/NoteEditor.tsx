"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { formatLastEdited } from "@/lib/dates";
import type { Category } from "@/lib/types";
import Close from "@/assets/svgs/close.svg";
import Delete from "@/assets/svgs/delete.svg";
import { CategorySelect } from "./CategorySelect";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function NoteEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const lastSaved = useRef("");

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setError("This note could not be found.");
      return;
    }
    Promise.all([api.categories(), api.note(id)])
      .then(([categoryResult, note]) => {
        setCategories(categoryResult.results);
        setCategory(note.category);
        setTitle(note.title);
        setContent(note.content);
        setUpdatedAt(note.updated_at);
        lastSaved.current = JSON.stringify({ category: note.category, title: note.title, content: note.content });
        setReady(true);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Could not open this note."));
  }, [id]);

  useEffect(() => {
    if (!ready || !category) return;
    const snapshot = JSON.stringify({ category, title, content });
    if (snapshot === lastSaved.current) return;
    setStatus("saving");
    const timer = window.setTimeout(async () => {
      try {
        const savedNote = await api.updateNote(id, { category, title, content });
        lastSaved.current = snapshot;
        setUpdatedAt(savedNote.updated_at);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [category, content, id, ready, title]);

  function markEdited() {
    setUpdatedAt(new Date().toISOString());
  }

  async function closeEditor() {
    const snapshot = JSON.stringify({ category, title, content });
    if (ready && snapshot !== lastSaved.current) {
      setStatus("saving");
      try {
        await api.updateNote(id, { category, title, content });
        lastSaved.current = snapshot;
      } catch (cause) {
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Could not save the latest changes.");
        return;
      }
    }
    router.push("/notes");
  }

  async function remove() {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    await api.deleteNote(id);
    router.replace("/notes");
  }

  const selectedCategory = categories.find((item) => item.id === category);
  if (!ready && !error) return <div className="flex min-h-screen items-center justify-center gap-3 text-[13px] text-muted" role="status"><span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />Opening your note…</div>;
  if (!ready) return <main className="grid min-h-screen place-content-center justify-items-center p-6 text-center"><div className="text-[62px] text-accent" aria-hidden="true">✎</div><h1 className="mb-1 mt-3 font-serif text-3xl font-medium">That note is unavailable.</h1><p className="mb-5 max-w-[420px] text-muted" role="alert">{error}</p><button className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-accent bg-accent px-[22px] text-sm font-bold text-cream" onClick={() => router.push("/notes")}>Back to notes</button></main>;

  return <main className="flex flex-col min-h-screen pb-12 pt-8 px-10">
    <header className="mb-3.5 flex min-h-12 items-center gap-3 max-sm:gap-[5px]">
      <CategorySelect categories={categories} value={category} onChange={(categoryId) => { setCategory(categoryId); markEdited(); }} />
      <span className={`text-[11px] ${status === "error" ? "text-danger" : status === "saved" ? "text-success" : "text-muted"}`}>{status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Save failed" : ""}</span>
      <div className="flex-1" />
      <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent hover:bg-line/10" onClick={remove} aria-label="Delete note" title="Delete note"><Delete className="h-6 w-6" aria-hidden="true" /></button>
      <Close className="w-6 h-6 cursor-pointer rounded-full border-0 bg-transparent " onClick={closeEditor} />
    </header>
    {error && <div className="mb-3 rounded-[9px] bg-error-surface px-3 py-2.5 text-xs text-error-text" role="alert">{error}</div>}
    <article className="flex flex-col flex-1 rounded-[11px] border px-[72px] py-[40px] max-sm:px-6 max-sm:py-[30px]" style={{ backgroundColor: `${selectedCategory?.color ?? "#EF9C66"}88`, borderColor: selectedCategory?.color ?? "#EF9C66", borderWidth: 3 }}>
      <p className="mb-6 self-end text-[10px] text-ink/70">
        <time dateTime={updatedAt}>{formatLastEdited(updatedAt)}</time>
      </p>
      <input className="w-full border-0 bg-transparent p-0 outline-none text-black text-[24px] font-serif font-bold  placeholder-black/50" aria-label="Note title" value={title} onChange={(event) => { setTitle(event.target.value); markEdited(); }} placeholder="Note Title" maxLength={160} autoFocus />
      <textarea className="mt-[22px] min-h-[300px] w-full flex-1 border-0 bg-transparent p-0 font-inter text-[16px] outline-none placeholder-black/50" aria-label="Note content" value={content} onChange={(event) => { setContent(event.target.value); markEdited(); }} placeholder="Pour your heart out…" />
    </article>
  </main>;
}
