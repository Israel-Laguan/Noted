import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useNoteEditor(id: number) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        lastSaved.current = JSON.stringify({
          category: note.category,
          title: note.title,
          content: note.content,
        });
        setReady(true);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Could not open this note.")
      );
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

  async function confirmDelete() {
    setShowDeleteModal(false);
    await api.deleteNote(id);
    router.replace("/notes");
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
    status,
    ready,
    error,
    showDeleteModal,
    setShowDeleteModal,
    markEdited,
    closeEditor,
    confirmDelete,
    remove: () => setShowDeleteModal(true),
    goBack: () => router.push("/notes"),
  };
}
