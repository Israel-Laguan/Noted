export type User = { id: number; email: string; first_name: string };
export type Category = { id: number; name: string; color: string; note_count: number; created_at: string };
export type Note = {
  id: number; category: number; category_name: string; category_color: string;
  title: string; content: string; created_at: string; updated_at: string;
};
export type Tokens = { access: string; refresh: string };
export type AuthResponse = Tokens & { user: User };
export type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] };

