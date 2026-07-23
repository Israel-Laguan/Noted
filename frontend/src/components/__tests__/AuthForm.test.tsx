import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "../AuthForm";

const login = vi.fn();
const register = vi.fn();
vi.mock("../AuthProvider", () => ({ useAuth: () => ({ login, register }) }));
vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/assets/svgs/eye.svg", () => ({ default: () => <svg aria-hidden="true" /> }));

describe("AuthForm", () => {
  beforeEach(() => { login.mockReset(); register.mockReset(); });
  it("submits login credentials", async () => {
    const user = userEvent.setup(); render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText("Email address"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "strong-pass-123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(login).toHaveBeenCalledWith("owner@example.com", "strong-pass-123");
  });
  it("shows API errors", async () => {
    login.mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup(); render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText("Email address"), "owner@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
