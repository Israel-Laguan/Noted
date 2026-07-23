import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

function useAutosave(
  id: number,
  ready: boolean,
  category: number,
  title: string,
  content: string,
  onSaved: (updatedAt: string) => void,
  onFirstSaved?: () => void
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const lastSaved = useRef("");
  const saveIdRef = useRef(0);

  useEffect(() => {
    if (!ready || !category) return;
    const snapshot = JSON.stringify({ category, title, content });
    if (snapshot === lastSaved.current) {
      setStatus("idle");
      return;
    }
    setStatus("saving");
    const currentSaveId = ++saveIdRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const savedNote = await api.updateNote(id, { category, title, content });
        if (currentSaveId !== saveIdRef.current) return;
        lastSaved.current = snapshot;
        setStatus("saved");
        onSaved(savedNote.updated_at);
        onFirstSaved?.();
        return savedNote;
      } catch {
        if (currentSaveId !== saveIdRef.current) return;
        setStatus("error");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [category, content, id, onFirstSaved, onSaved, ready, title]);

  function markSaved(snapshot: string) {
    lastSaved.current = snapshot;
  }

  function getSnapshot() {
    return JSON.stringify({ category, title, content });
  }

  function isDirty() {
    return getSnapshot() !== lastSaved.current;
  }

  return { status, setStatus, markSaved, getSnapshot, isDirty };
}

export function useNoteEditor(id: number) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const autosave = useAutosave(id, ready, category, title, content, setUpdatedAt, () =>
    setIsNew(false)
  );

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
        autosave.markSaved(
          JSON.stringify({ category: note.category, title: note.title, content: note.content })
        );
        setIsNew(!note.title && !note.content);
        setReady(true);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Could not open this note.")
      );
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function flushSave() {
    autosave.setStatus("saving");
    const snapshot = autosave.getSnapshot();
    const savedNote = await api.updateNote(id, { category, title, content });
    autosave.markSaved(snapshot);
    setIsNew(false);
    return savedNote;
  }

  async function closeEditor() {
    setClosing(true);
    if (!title.trim() && !content.trim()) {
      try {
        await api.deleteNote(id);
      } catch {
        // Note may have already been deleted; navigate back regardless
      }
      router.push("/notes");
      return;
    }
    if (ready && autosave.isDirty()) {
      try {
        await flushSave();
      } catch (cause) {
        setClosing(false);
        autosave.setStatus("error");
        setError(cause instanceof Error ? cause.message : "Could not save the latest changes.");
        return;
      }
    }
    router.push("/notes");
  }

  async function confirmDelete() {
    setShowDeleteModal(false);
    try {
      await api.deleteNote(id);
      router.replace("/notes");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete this note.");
    }
  }

  return {
    categories,
    category,
    setCategory,
    title,
    setTitle,
    content,
    setContent,
    updatedAt,
    status: autosave.status,
    ready,
    closing,
    error,
    showDeleteModal,
    setShowDeleteModal,
    markEdited: () => setUpdatedAt(new Date().toISOString()),
    closeEditor,
    confirmDelete,
    remove: () => setShowDeleteModal(true),
    goBack: () => router.push("/notes"),
    isNew,
  };
}
