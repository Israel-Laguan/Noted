"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LogoutModal } from "./LogoutModal";
import waiting from "@/assets/imgs/waiting.png";
import Plus from "@/assets/svgs/plus.svg";
import { api } from "@/lib/api";
import type { Category, Note } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { NoteCard } from "./NoteCard";

const primaryButton =
  "flex min-h-[42px] cursor-pointer items-center justify-center gap-1.5 rounded-full border border-line px-4 text-[16px] font-bold text-line hover:bg-line/20";
const categoryButton =
  "flex h-8 w-full cursor-pointer items-center border-0 bg-transparent px-4 text-left text-[12px] hover:bg-line/20 max-sm:w-auto max-sm:shrink-0 max-sm:px-2";

function SearchBar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="group relative flex h-11 w-[280px] items-center gap-2 rounded-full border border-line px-[15px] max-sm:w-40">
        <input
          className="min-w-0 w-full border-0 bg-transparent p-2 text-[12px] outline-none"
          aria-label="Search notes"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search notes"
        />
      </label>
    </div>
  );
}

function CategoryList({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: number | undefined;
  onSelect: (id: number | undefined) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <button
        className={`${categoryButton} ${!selected ? "font-bold" : ""}`}
        onClick={() => onSelect(undefined)}
      >
        <span>All Categories</span>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${categoryButton} ${selected === category.id ? "font-bold" : ""}`}
          onClick={() => onSelect(category.id)}
        >
          <span className="flex items-center gap-[9px]">
            <i className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
            {category.name}
          </span>
          <span
            className="ml-auto pl-4 tabular-nums max-sm:pl-2"
            aria-label={`${category.note_count} notes`}
          >
            {category.note_count}
          </span>
        </button>
      ))}
    </div>
  );
}

function NotesGrid({
  notes,
  loading,
  error,
  search,
  onRetry,
}: {
  notes: Note[];
  loading: boolean;
  error: string;
  search: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-6 pt-1">
      {error && (
        <div
          className="mb-3.5 flex shrink-0 items-center justify-between rounded-[9px] bg-error-surface px-3 py-2.5 text-xs text-error-text"
          role="alert"
        >
          {error}
          <button
            className="border-0 bg-transparent text-xs font-extrabold underline"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div
          className="grid w-full grid-cols-3 gap-4 max-sm:grid-cols-1"
          aria-label="Loading notes"
        >
          {[1, 2, 3].map((item) => (
            <span
              className="h-[180px] animate-shimmer rounded-[13px] bg-[linear-gradient(100deg,#edddca_25%,#f7ead9_40%,#edddca_60%)] bg-[length:200%_100%] motion-reduce:animate-none"
              key={item}
            />
          ))}
        </div>
      ) : notes.length ? (
        <div className="grid w-full grid-cols-3 items-start gap-3.5 max-[900px]:grid-cols-2 max-sm:grid-cols-1">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex flex-col items-center pt-[120px]">
          <Image
            src={waiting}
            alt="Waiting"
            width={300}
            height={300}
            className="animate-waitingBounce"
          />
          <p className="text-[24px] text-muted">
            {search ? "No matching notes" : "I'm just here waiting for your charming notes..."}
          </p>
        </div>
      )}
    </div>
  );
}

export function NotesDashboard() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [error, setError] = useState("");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.notes({ category: selected, search });
      setNotes(response.results);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load notes.");
    } finally {
      setLoading(false);
    }
  }, [search, selected]);

  useEffect(() => {
    api
      .categories()
      .then((result) => setCategories(result.results))
      .catch(() => setError("Could not load categories."));
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(loadNotes, 200);
    return () => window.clearTimeout(timer);
  }, [loadNotes]);

  return (
    <main className="flex h-screen flex-col overflow-hidden pl-6 pr-9 max-sm:px-4">
      <header className="flex shrink-0 justify-end gap-6 pt-10 max-sm:gap-3 max-sm:pt-4">
        <SearchBar search={search} onSearchChange={setSearch} />
        <Link href="/notes/new" className={primaryButton}>
          <Plus className="h-4 w-4" />
          <span className="max-sm:hidden">New Note</span>
        </Link>
      </header>

      <div className="mt-5 flex min-h-0 flex-1 gap-8 max-sm:flex-col max-sm:gap-3">
        <aside className="flex w-64 shrink-0 flex-col max-sm:flex max-sm:w-full max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:scroll-smooth max-sm:[-ms-overflow-style:none] max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden">
          <CategoryList categories={categories} selected={selected} onSelect={setSelected} />
          <div className="mt-3 h-px bg-line/30" />
          <button
            className="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-full px-3 py-2 text-[14px] font-bold text-line hover:bg-red-500/10"
            onClick={() => setShowLogoutModal(true)}
            title="Log out"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-line font-bold text-white">
              {user?.first_name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
            </span>
            <span>Logout</span>
          </button>
          <LogoutModal
            open={showLogoutModal}
            onConfirm={logout}
            onCancel={() => setShowLogoutModal(false)}
          />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-label="Notes">
          <NotesGrid
            notes={notes}
            loading={loading}
            error={error}
            search={search}
            onRetry={loadNotes}
          />
        </section>
      </div>
    </main>
  );
}
