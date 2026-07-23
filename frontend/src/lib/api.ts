import type { AuthResponse, Category, Note, Paginated, Tokens, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
const TOKEN_KEY = "notes.tokens";

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) { super(message); }
}

export function getTokens(): Tokens | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Tokens; } catch { return null; }
}

export function saveTokens(tokens: Tokens | null) {
  if (typeof window === "undefined") return;
  if (tokens) window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  else window.localStorage.removeItem(TOKEN_KEY);
}

function errorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Something went wrong. Please try again.";
  const payload = body as { error?: { details?: unknown }; detail?: string };
  if (payload.detail) return payload.detail;
  const details = payload.error?.details;
  if (typeof details === "string") return details;
  if (details && typeof details === "object") {
    const first = Object.values(details as Record<string, unknown>)[0];
    if (Array.isArray(first)) return String(first[0]);
    if (typeof first === "string") return first;
  }
  return "Something went wrong. Please try again.";
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = getTokens();
  if (!tokens?.refresh) return null;
  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh: tokens.refresh }),
  });
  if (!response.ok) { saveTokens(null); return null; }
  const data = await response.json() as { access: string; refresh?: string };
  saveTokens({ access: data.access, refresh: data.refresh ?? tokens.refresh });
  return data.access;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const tokens = getTokens();
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (tokens?.access) headers.set("Authorization", `Bearer ${tokens.access}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && tokens?.refresh) {
    const access = await refreshAccessToken();
    if (access) return request<T>(path, init, false);
  }
  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = null; }
    throw new ApiError(errorMessage(body), response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  register: (payload: { email: string; password: string; first_name?: string }) => request<AuthResponse>("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) => request<AuthResponse>("/auth/token/", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<User>("/auth/me/"),
  categories: () => request<Paginated<Category>>("/categories/"),
  notes: (params?: { category?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", String(params.category));
    if (params?.search) query.set("search", params.search);
    return request<Paginated<Note>>(`/notes/${query.size ? `?${query}` : ""}`);
  },
  note: (id: number) => request<Note>(`/notes/${id}/`),
  createNote: (payload: Pick<Note, "category" | "title" | "content">) => request<Note>("/notes/", { method: "POST", body: JSON.stringify(payload) }),
  updateNote: (id: number, payload: Partial<Pick<Note, "category" | "title" | "content">>) => request<Note>(`/notes/${id}/`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteNote: (id: number) => request<void>(`/notes/${id}/`, { method: "DELETE" }),
};
