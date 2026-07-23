import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewNoteBootstrap } from "../NewNoteBootstrap";

const { replace, categories, createNote } = vi.hoisted(() => ({
  replace: vi.fn(),
  categories: vi.fn(),
  createNote: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/lib/api", () => ({ api: { categories, createNote } }));

describe("NewNoteBootstrap", () => {
  beforeEach(() => {
    replace.mockReset();
    categories.mockReset().mockResolvedValue({ results: [{ id: 7, name: "Random Thoughts" }] });
    createNote.mockReset().mockResolvedValue({ id: 42 });
  });

  it("creates a blank note immediately and opens its editor", async () => {
    render(<NewNoteBootstrap />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/notes/42"));
    expect(createNote).toHaveBeenCalledWith({ category: 7, title: "", content: "" });
  });
});
