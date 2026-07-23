import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NoteCard } from "../NoteCard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NoteCard", () => {
  it("renders note details and destination", () => {
    render(
      <NoteCard
        note={{
          id: 42,
          category: 2,
          category_name: "Personal",
          category_color: "#A9C8C0",
          title: "Vacation ideas",
          content: "Visit Bali",
          created_at: "2026-07-01T12:00:00Z",
          updated_at: "2026-07-22T12:00:00Z",
        }}
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/notes/42");
    expect(screen.getByRole("heading", { name: "Vacation ideas" })).toBeInTheDocument();
    expect(screen.getByText("Visit Bali")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });
  it("uses a friendly title for blank notes", () => {
    render(
      <NoteCard
        note={{
          id: 1,
          category: 1,
          category_name: "School",
          category_color: "#F5D98B",
          title: "",
          content: "",
          created_at: "2026-07-01T12:00:00Z",
          updated_at: "2026-07-01T12:00:00Z",
        }}
      />
    );
    expect(screen.getByRole("heading", { name: "Untitled note" })).toBeInTheDocument();
  });
});
