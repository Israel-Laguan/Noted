"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, getTokens, saveTokens } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string) => Promise<void>; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!getTokens()) { setLoading(false); return; }
    api.me().then(setUser).catch(() => saveTokens(null)).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname === "/login" || pathname === "/signup";
    if (!user && !isAuthPage && pathname !== "/") router.replace("/login");
    if (user && isAuthPage) router.replace("/notes");
  }, [loading, pathname, router, user]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password }); saveTokens(result); setUser(result.user); router.replace("/notes");
  }, [router]);
  const register = useCallback(async (email: string, password: string) => {
    const result = await api.register({ email, password }); saveTokens(result); setUser(result.user); router.replace("/notes");
  }, [router]);
  const logout = useCallback(() => { saveTokens(null); setUser(null); router.replace("/login"); }, [router]);
  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || !user) return <div className="flex min-h-screen items-center justify-center gap-3 text-[13px] text-muted" role="status"><span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" />Loading your notes…</div>;
  return <>{children}</>;
}
