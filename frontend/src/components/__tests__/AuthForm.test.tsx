import { render, screen, waitFor } from "@testing-library/react";
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

  describe("login mode", () => {
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

  describe("signup mode", () => {
    it("submits registration credentials", async () => {
      const user = userEvent.setup(); render(<AuthForm mode="signup" />);
      await user.type(screen.getByLabelText("Email address"), "new@example.com");
      await user.type(screen.getByLabelText("Password"), "strong-pass-123");
      await user.click(screen.getByRole("button", { name: "Sign Up" }));
      expect(register).toHaveBeenCalledWith("new@example.com", "strong-pass-123");
    });

    it("shows API errors", async () => {
      register.mockRejectedValue(new Error("An account with this email already exists."));
      const user = userEvent.setup(); render(<AuthForm mode="signup" />);
      await user.type(screen.getByLabelText("Email address"), "new@example.com");
      await user.type(screen.getByLabelText("Password"), "strong-pass-123");
      await user.click(screen.getByRole("button", { name: "Sign Up" }));
      expect(await screen.findByRole("alert")).toHaveTextContent("An account with this email already exists.");
    });
  });

  describe("password visibility", () => {
    it("toggles password visibility", async () => {
      const user = userEvent.setup(); render(<AuthForm mode="login" />);
      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      expect(passwordInput.type).toBe("password");
      await user.click(screen.getByRole("button", { name: "Show password" }));
      expect(passwordInput.type).toBe("text");
      await user.click(screen.getByRole("button", { name: "Hide password" }));
      expect(passwordInput.type).toBe("password");
    });
  });

  describe("submitting state", () => {
    it("shows a loading label and disables the button while submitting", async () => {
      login.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup(); render(<AuthForm mode="login" />);
      await user.type(screen.getByLabelText("Email address"), "owner@example.com");
      await user.type(screen.getByLabelText("Password"), "strong-pass-123");
      await user.click(screen.getByRole("button", { name: "Login" }));
      expect(screen.getByRole("button", { name: "One moment…" })).toBeDisabled();
    });

    it("re-enables the button after an error", async () => {
      login.mockRejectedValue(new Error("Invalid credentials"));
      const user = userEvent.setup(); render(<AuthForm mode="login" />);
      await user.type(screen.getByLabelText("Email address"), "owner@example.com");
      await user.type(screen.getByLabelText("Password"), "wrong-password");
      await user.click(screen.getByRole("button", { name: "Login" }));
      await screen.findByRole("alert");
      await waitFor(() => expect(screen.getByRole("button", { name: "Login" })).toBeEnabled());
    });
  });

  describe("navigation", () => {
    it("links to the signup page from login", () => {
      render(<AuthForm mode="login" />);
      expect(screen.getByRole("link", { name: /never been here before/ })).toHaveAttribute("href", "/signup");
    });

    it("links to the login page from signup", () => {
      render(<AuthForm mode="signup" />);
      expect(screen.getByRole("link", { name: /already friends/ })).toHaveAttribute("href", "/login");
    });
  });

  describe("form validation", () => {
    it("requires email and password fields", () => {
      render(<AuthForm mode="login" />);
      expect(screen.getByLabelText("Email address")).toBeRequired();
      expect(screen.getByLabelText("Password")).toBeRequired();
    });

    it("enforces a minimum password length of 8 characters", () => {
      render(<AuthForm mode="login" />);
      expect(screen.getByLabelText("Password")).toHaveAttribute("minlength", "8");
    });

    it("uses email autocomplete for login and new-password for signup", () => {
      const { unmount } = render(<AuthForm mode="login" />);
      expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
      unmount();
      render(<AuthForm mode="signup" />);
      expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
    });
  });
});
