import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotesDashboard } from "../NotesDashboard";

const { logout, notes, categories } = vi.hoisted(() => ({
  logout: vi.fn(),
  notes: vi.fn(),
  categories: vi.fn(),
}));

vi.mock("../AuthProvider", () => ({
  useAuth: () => ({ user: { id: 1, email: "owner@example.com", first_name: "Owner" }, logout }),
}));
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
vi.mock("@/lib/api", () => ({ api: { notes, categories } }));
vi.mock("@/assets/svgs/plus.svg", () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
}));

describe("NotesDashboard", () => {
  beforeEach(() => {
    logout.mockReset();
    notes.mockReset().mockResolvedValue({ results: [] });
    categories.mockReset().mockResolvedValue({
      results: [
        {
          id: 1,
          name: "Personal",
          color: "#7CB3B1",
          note_count: 3,
          created_at: "2026-07-22T12:00:00Z",
        },
      ],
    });
  });

  it("renders the logout button with the user's initial", async () => {
    render(<NotesDashboard />);
    await waitFor(() => expect(screen.getByTitle("Log out")).toBeInTheDocument());
    expect(screen.getByText("O")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("opens the logout confirmation modal when clicked", async () => {
    const user = userEvent.setup();
    render(<NotesDashboard />);
    await waitFor(() => expect(screen.getByTitle("Log out")).toBeInTheDocument());
    await user.click(screen.getByTitle("Log out"));
    expect(screen.getByRole("dialog", { name: /confirm logout/i })).toBeInTheDocument();
  });

  it("calls logout when confirmed in the modal", async () => {
    const user = userEvent.setup();
    render(<NotesDashboard />);
    await waitFor(() => expect(screen.getByTitle("Log out")).toBeInTheDocument());
    await user.click(screen.getByTitle("Log out"));
    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(logout).toHaveBeenCalledOnce();
  });

  it("closes the modal without logging out when cancelled", async () => {
    const user = userEvent.setup();
    render(<NotesDashboard />);
    await waitFor(() => expect(screen.getByTitle("Log out")).toBeInTheDocument());
    await user.click(screen.getByTitle("Log out"));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(logout).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
