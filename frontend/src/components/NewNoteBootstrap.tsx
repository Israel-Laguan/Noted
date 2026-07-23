"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export function NewNoteBootstrap() {
  const router = useRouter();
  const [error, setError] = useState("");
  const creating = useRef(false);

  const createNote = useCallback(async () => {
    if (creating.current) return;
    creating.current = true;
    setError("");
    try {
      const categoryResult = await api.categories();
      const defaultCategory = categoryResult.results[0];
      if (!defaultCategory) throw new Error("No category is available for this note.");
      const note = await api.createNote({ category: defaultCategory.id, title: "", content: "" });
      router.replace(`/notes/${note.id}`);
    } catch (cause) {
      creating.current = false;
      setError(cause instanceof Error ? cause.message : "Could not create the note.");
    }
  }, [router]);

  useEffect(() => {
    void createNote();
  }, [createNote]);

  return (
    <main className="grid min-h-screen place-content-center justify-items-center p-6 text-center">
      {error ? (
        <>
          <div className="text-[62px] text-accent" aria-hidden="true">
            ✎
          </div>
          <h1 className="mb-1 mt-3 font-serif text-3xl font-medium">
            We couldn&apos;t create that note.
          </h1>
          <p className="mb-5 max-w-[420px] text-muted" role="alert">
            {error}
          </p>
          <button
            className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-accent bg-accent px-[22px] text-sm font-bold text-cream"
            onClick={createNote}
          >
            Try again
          </button>
        </>
      ) : (
        <div
          className="flex min-h-screen items-center justify-center gap-3 text-[13px] text-muted"
          role="status"
        >
          <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
          Creating your note…
        </div>
      )}
    </main>
  );
}
