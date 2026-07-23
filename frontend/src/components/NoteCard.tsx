import Link from "next/link";
import type { Note } from "@/lib/types";
import { formatNoteDate } from "@/lib/dates";

export function NoteCard({ note }: { note: Note }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="block h-[246px] overflow-hidden rounded-[11px] border p-4 text-black no-underline duration-200 shadow-[1px_1px_2px_0_rgba(0,0,0,0.25)] hover:-translate-y-[3px]"
      style={{
        backgroundColor: `${note.category_color}88`,
        borderColor: note.category_color,
        borderWidth: 3,
      }}
    >
      <div className="flex items-center gap-2 text-[12px]">
        <time className="font-bold" dateTime={note.updated_at}>
          {formatNoteDate(note.updated_at)}
        </time>
        <span>{note.category_name}</span>
      </div>
      <h2 className="my-3 line-clamp-2 font-serif text-[24px] font-bold">
        {note.title.trim() || "Untitled note"}
      </h2>
      {note.content && (
        <p className="line-clamp-6 whitespace-pre-wrap text-[12px]">{note.content}</p>
      )}
    </Link>
  );
}
