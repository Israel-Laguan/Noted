"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import signin from "@/assets/imgs/signin.png";
import signup from "@/assets/imgs/signup.png";
import Eye from "@/assets/svgs/eye.svg";

const inputClasses = "font-sans h-10 w-full rounded-[6px] bg-transparent border border-line px-[15px] outline-none placeholder-black focus:border-accent focus:ring-4 focus:ring-accent/10 text-[12px]";
const primaryButtonClasses = "inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-full border border-line text-[16px] text-line font-bold hover:bg-line/20";

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

  return <main className="grid min-h-screen place-items-center bg-auth">
    <section className="flex flex-col max-w-[384px] place-items-center px-4" aria-labelledby="auth-title">
      {isSignup ? <Image
        src={signin}
        alt="Sign In"
        width={190}
        height={140}
        className="animate-characterBounce"
      /> :
        <Image
          src={signup}
          alt="Sign Up"
          width={96}
          height={114}
          className="animate-characterBounce"
        />
      }
      <h1 id="auth-title" className="mb-8 text-center font-serif text-[48px] font-bold text-muted sm:text-left">{isSignup ? "Yay, New Friend!" : "Yay, You're Back!"}</h1>
      <form onSubmit={submit} className="w-full flex flex-col gap-[17px] text-left">
        <input className={inputClasses} aria-label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="Email Address" required />
        <span className="relative block w-full">
          <input className={`${inputClasses} pr-[45px]`} aria-label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? "new-password" : "current-password"} minLength={8} placeholder="At least 8 characters" required />
          <button className="absolute right-[15px] top-px h-full border-0 bg-transparent" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
            <Eye className="w-4 h-4" />
          </button>
        </span>
        {error && <p className="m-0 rounded-[9px] bg-error-surface px-3 py-2.5 text-xs text-error-text" role="alert">{error}</p>}
        <button className={`${primaryButtonClasses} mt-[5px]`} type="submit" disabled={submitting}>{submitting ? "One moment…" : isSignup ? "Sign Up" : "Login"}</button>
      </form>
      <Link className="mt-4 text-[12px] text-line underline" href={isSignup ? "/login" : "/signup"}>{isSignup ? "We're already friends!" : "Oops! I’ve never been here before"}</Link>
    </section>
  </main>;
}
