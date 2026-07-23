import { Protected } from "@/components/AuthProvider";
export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <Protected>{children}</Protected>;
}
