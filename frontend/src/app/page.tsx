"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTokens } from "@/lib/api";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getTokens() ? "/notes" : "/signup");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-[13px] text-muted">
      <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />
      Opening Noted…
    </div>
  );
}
