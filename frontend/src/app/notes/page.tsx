import type { Metadata } from "next";
import { NotesDashboard } from "@/components/NotesDashboard";
export const metadata: Metadata = { title: "My notes" };
export default function NotesPage() {
  return <NotesDashboard />;
}
