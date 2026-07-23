import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LogoutModal } from "../LogoutModal";

describe("LogoutModal", () => {
  it("does not render when closed", () => {
    const { container } = render(<LogoutModal open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the confirmation message when open", () => {
    render(<LogoutModal open={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("dialog", { name: /confirm logout/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to log out/i)).toBeInTheDocument();
  });

  it("calls onConfirm when the Log out button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<LogoutModal open={true} onConfirm={onConfirm} onCancel={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when the Cancel button is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<LogoutModal open={true} onConfirm={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when clicking the overlay", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<LogoutModal open={true} onConfirm={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole("dialog"));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});