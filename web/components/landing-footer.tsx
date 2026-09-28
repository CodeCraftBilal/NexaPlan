"use client";

import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight, Plus } from "lucide-react";
import { Brand } from "@/components/brand";

export function LandingFooter({ authenticated }: { authenticated: boolean }) {
  const destination = authenticated ? "/dashboard" : "/register";

  return (
    <footer className="border-t border-border bg-[#151815]">
      <div className="mx-auto max-w-[1920px] px-6 pb-7 pt-12 sm:px-10">
        <div className="grid gap-10 pb-10 md:grid-cols-[1.1fr_0.7fr_1.2fr] md:gap-8">
          <div>
            <Brand />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400">
              A little more organized. A little more possible. Make room for
              your next big idea.
            </p>
            <Link
              href={destination}
              className="group mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {authenticated
                ? "Open your workspace"
                : "Start your next chapter"}
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </Link>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-sm font-semibold text-foreground">
              Explore ProjectAI
            </h2>
            <div className="mt-4 flex flex-col items-start">
              {[
                { href: "#how-it-works", label: "How it works" },
                { href: "#get-started", label: "Your next step" },
                {
                  href: authenticated ? "/dashboard" : "/login",
                  label: authenticated ? "Your workspace" : "Sign in",
                },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex min-h-11 items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-primary"
                >
                  {link.label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  />
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              A little clarity
            </h2>
            {[
              {
                question: "Where do I start?",
                answer:
                  "Create an account, set up a workspace, and add your first project. Break your idea into tasks and invite your team when you’re ready.",
              },
              {
                question: "How can AI help my team?",
                answer:
                  "Ask AI to turn an idea into a project plan, summarize your progress, or help spot what may be holding your team back.",
              },
            ].map((item) => (
              <details
                key={item.question}
                className="group border-b border-border open:pb-4"
              >
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm text-zinc-300 transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <Plus
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  />
                </summary>
                <p className="pr-5 text-sm leading-relaxed text-zinc-400">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} ProjectAI. Big ideas start here.
          </p>
          <button
            type="button"
            onClick={() => {
              const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
              ).matches;
              window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "instant" : "smooth",
              });
              document.getElementById("home")?.focus({ preventScroll: true });
            }}
            className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            Back to top
            <ArrowUp
              aria-hidden="true"
              className="size-4 transition-transform group-hover:-translate-y-0.5 motion-reduce:transform-none"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
