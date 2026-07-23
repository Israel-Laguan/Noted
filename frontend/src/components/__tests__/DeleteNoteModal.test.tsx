import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteNoteModal } from "../DeleteNoteModal";

describe("DeleteNoteModal", () => {
  it("does not render when closed", () => {
    const { container } = render(
      <DeleteNoteModal open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the confirmation message when open", () => {
    render(<DeleteNoteModal open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: /confirm delete note/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this note/i)).toBeInTheDocument();
  });

  it("calls onConfirm when the Delete button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<DeleteNoteModal open={true} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<DeleteNoteModal open={true} onConfirm={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when clicking the overlay", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<DeleteNoteModal open={true} onConfirm={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole("dialog"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<DeleteNoteModal open={true} onConfirm={vi.fn()} onCancel={onCancel} />);
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
