import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategorySelect } from "../CategorySelect";

vi.mock("@/assets/svgs/down.svg", () => ({ default: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} /> }));

const categories = [
  { id: 1, name: "Random Thoughts", color: "#EF9C66", note_count: 2, created_at: "2026-07-22T12:00:00Z" },
  { id: 2, name: "School", color: "#FCD980", note_count: 1, created_at: "2026-07-22T12:00:00Z" },
  { id: 3, name: "Personal", color: "#7CB3B1", note_count: 3, created_at: "2026-07-22T12:00:00Z" },
];

describe("CategorySelect", () => {
  it("opens the category list and selects an option", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategorySelect categories={categories} value={1} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Category" }));
    expect(screen.getByRole("listbox", { name: "Categories" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Personal" }));

    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports arrow and enter keyboard selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategorySelect categories={categories} value={1} onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: "Category" });
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
