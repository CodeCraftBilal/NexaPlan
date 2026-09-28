"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { api, getApiError } from "@/lib/api";
import { initializeAuth, isSessionUser } from "@/lib/auth-session";
import { safeReturnTo } from "@/lib/auth-navigation";
import { useAuthStore } from "@/stores/authStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

export function AuthFormSkeleton() {
  return (
    <div role="status" className="space-y-5 animate-pulse">
      <div className="h-9 w-2/3 rounded-lg bg-surface" />
      <div className="h-4 w-full rounded bg-surface" />
      <div className="h-12 rounded-xl bg-surface" />
      <div className="h-12 rounded-xl bg-surface" />
      <span className="sr-only">Loading sign-in form</span>
    </div>
  );
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const register = mode === "register";
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = safeReturnTo(searchParams.get("next"));
  const {
    isAuthenticated,
    isLoading: checkingSession,
    sessionError,
    setUser,
  } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (isAuthenticated && !checkingSession) router.replace(destination);
  }, [checkingSession, destination, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || checkingSession) return;
    setSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      const response = await api.post(`/auth/${mode}`, {
        ...(register ? { name: name.trim() } : {}),
        email: email.trim().toLowerCase(),
        password,
      });
      if (!response.data.success || !isSessionUser(response.data.user)) {
        setError(
          "The server returned an unexpected response. Please try again.",
        );
        return;
      }
      setUser(response.data.user);
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      const issues: unknown = axios.isAxiosError(cause)
        ? cause.response?.data?.errors
        : undefined;
      if (Array.isArray(issues)) {
        const errors: FieldErrors = {};
        for (const issue of issues) {
          const key: unknown = issue?.path?.[0];
          if (
            (key === "name" || key === "email" || key === "password") &&
            typeof issue.message === "string"
          )
            errors[key] = issue.message;
        }
        setFieldErrors(errors);
        setError(
          Object.keys(errors).length
            ? "Please check the highlighted fields."
            : getApiError(cause),
        );
      } else {
        setError(getApiError(cause));
      }
    } finally {
      setSubmitting(false);
    }
  }

  const otherPage = register ? "/login" : "/register";
  const otherHref =
    destination === "/dashboard"
      ? otherPage
      : `${otherPage}?next=${encodeURIComponent(destination)}`;

  return (
    <div>
      <div className="mb-8">
        <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-primary">
          <LockKeyhole size={20} />
        </div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[#939e88]">
          {register ? "Make room for what’s next" : "Your workspace is waiting"}
        </p>
        <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
          {register ? "Start something great." : "Good to have you back."}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#929c87]">
          {register
            ? "Create your account and bring your ideas to life."
            : "Sign in to pick up where you left off."}
        </p>
      </div>

      {sessionError && !error && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-5 text-amber-200"
        >
          {sessionError}
          <button
            type="button"
            className="ml-2 font-semibold underline underline-offset-2"
            onClick={() => void initializeAuth()}
          >
            Retry
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3.5 text-sm leading-5 text-red-200"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        {register && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Alex Morgan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={fieldErrors.name}
              minLength={2}
              maxLength={100}
              required
              disabled={submitting}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            required
            disabled={submitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder={
                register ? "Create a password" : "Enter your password"
              }
              className="pr-12"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={fieldErrors.password}
              aria-describedby={register ? "password-hint" : undefined}
              minLength={register ? 6 : undefined}
              required
              disabled={submitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-[#87937b] transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {register && (
            <p id="password-hint" className="text-xs text-[#828e76]">
              Use at least 6 characters.
            </p>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          disabled={checkingSession || isAuthenticated}
          isLoading={submitting || checkingSession}
        >
          {checkingSession
            ? "Checking your session…"
            : submitting
              ? register
                ? "Creating account…"
                : "Signing in…"
              : register
                ? "Create account"
                : "Sign in"}
          {!submitting && !checkingSession && (
            <ArrowRight size={16} className="ml-auto" />
          )}
        </Button>
      </form>
      <div className="mt-7 border-t border-border pt-6 text-center text-sm text-[#929c87]">
        {register ? "Already have an account?" : "New to ProjectAI?"}{" "}
        <Link
          href={otherHref}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {register ? "Sign in" : "Create an account"}
        </Link>
      </div>
    </div>
  );
}
