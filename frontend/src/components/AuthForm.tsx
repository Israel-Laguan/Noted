"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import signin from "@/assets/imgs/signin.png";
import signup from "@/assets/imgs/signup.png";
import Eye from "@/assets/svgs/eye.svg";

const inputClasses =
  "font-sans h-10 w-full rounded-[6px] bg-transparent border border-line px-[15px] outline-none placeholder-black focus:border-accent focus:ring-4 focus:ring-accent/10 text-[12px]";
const primaryButtonClasses =
  "inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-full border border-line text-[16px] text-line font-bold hover:bg-line/20";

function AuthImage({ isSignup }: { isSignup: boolean }) {
  return (
    <Image
      src={isSignup ? signin : signup}
      alt={isSignup ? "Sign In" : "Sign Up"}
      width={isSignup ? 190 : 96}
      height={isSignup ? 140 : 114}
      className="animate-characterBounce"
    />
  );
}

function AuthFormFields({
  isSignup,
  email,
  password,
  showPassword,
  error,
  submitting,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
}: {
  isSignup: boolean;
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  submitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-[17px] text-left">
      <input
        className={inputClasses}
        aria-label="Email address"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        autoComplete="email"
        placeholder="Email Address"
        required
      />
      <span className="relative block w-full">
        <input
          className={`${inputClasses} pr-[45px]`}
          aria-label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          placeholder="At least 8 characters"
          required
        />
        <button
          className="absolute right-[15px] top-px h-full border-0 bg-transparent"
          type="button"
          onClick={onTogglePassword}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <Eye className="w-4 h-4" />
        </button>
      </span>
      {error && (
        <p
          className="m-0 rounded-[9px] bg-error-surface px-3 py-2.5 text-xs text-error-text"
          role="alert"
        >
          {error}
        </p>
      )}
      <button className={`${primaryButtonClasses} mt-[5px]`} type="submit" disabled={submitting}>
        {submitting ? "One moment…" : isSignup ? "Sign Up" : "Login"}
      </button>
    </form>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) await register(email, password);
      else await login(email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete that request.");
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-auth">
      <section
        className="flex flex-col max-w-[384px] place-items-center px-4"
        aria-labelledby="auth-title"
      >
        <AuthImage isSignup={isSignup} />
        <h1
          id="auth-title"
          className="mb-8 text-center font-serif text-[48px] font-bold text-muted sm:text-left"
        >
          {isSignup ? "Yay, New Friend!" : "Yay, You're Back!"}
        </h1>
        <AuthFormFields
          isSignup={isSignup}
          email={email}
          password={password}
          showPassword={showPassword}
          error={error}
          submitting={submitting}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((value) => !value)}
          onSubmit={submit}
        />
        <Link
          className="mt-4 text-[12px] text-line underline"
          href={isSignup ? "/login" : "/signup"}
        >
          {isSignup ? "We're already friends!" : "Oops! I've never been here before"}
        </Link>
      </section>
    </main>
  );
}
