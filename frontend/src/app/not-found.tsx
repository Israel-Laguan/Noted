import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-content-center justify-items-center px-5 text-center">
    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">404</p>
    <h1 className="m-0 font-serif text-[42px]">That note wandered off.</h1>
    <p className="text-muted">It may have been deleted or the link may be wrong.</p>
    <Link className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-accent bg-accent px-[22px] text-sm font-bold text-cream hover:-translate-y-px" href="/notes">Back to notes</Link>
  </main>;
}
