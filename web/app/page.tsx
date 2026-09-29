"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Circle,
  Command,
  Layers,
  Sparkles,
  LayoutGrid,
  Target,
  Workflow,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { LandingFooter } from "@/components/landing-footer";
import { useAuthStore } from "@/stores/authStore";

export default function LandingPage() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const destination = authenticated ? "/dashboard" : "/register";
  return (
    <div className="overflow-hidden bg-background">
      <header
        id="home"
        tabIndex={-1}
        className="mx-auto flex min-h-24 flex-wrap py-5 max-w-[1920px] items-center justify-between gap-5 px-6 sm:px-10"
      >
        <Brand />
        <nav
          aria-label="Website navigation"
          className="flex flex-wrap items-center gap-4 sm:gap-6"
        >
          <a
            href="#how-it-works"
            className="hidden text-ui-body text-zinc-400 transition-colors hover:text-white sm:block"
          >
            How it works
          </a>
          <Link
            href={authenticated ? "/dashboard" : "/login"}
            className="text-ui-body text-zinc-300 transition-colors hover:text-primary"
          >
            {authenticated ? "Your workspace" : "Sign in"}
          </Link>
          <Link
            href={destination}
            className="btn-primary min-h-10! px-4! py-2.5! text-ui-body!"
          >
            Get started <ArrowUpRight className="size-3.5" />
          </Link>
        </nav>
      </header>
      <main>
        <section className="relative mx-auto grid max-w-[1920px] items-center gap-14 px-6 pb-20 pt-10 sm:px-10 sm:pt-16 lg:min-h-162.5 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:pb-24">
          <div className="page-enter relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-ui-meta text-zinc-300">
              <span className="size-1.5 rounded-full bg-primary" />A clearer way
              to move work forward
              <ArrowUpRight className="ml-1 size-3 text-primary" />
            </div>
            <h1 className="max-w-xl text-[48px] font-medium leading-[1.08] tracking-[-2.5px] sm:text-[64px] sm:tracking-[-3.5px]">
              Big ideas.
              <br />
              Clear plans.
              <br />
              <span className="text-primary">Real progress.</span>
            </h1>
            <p className="mt-7 max-w-md text-[17px] leading-[1.85] text-zinc-400">
              Bring your projects, people, and next steps together. Meet the
              thoughtful workspace with AI on your side.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href={destination} className="btn-primary px-6! py-3.5!">
                {authenticated
                  ? "Open your workspace"
                  : "Build something great"}
                <ArrowRight className="size-4" />
              </Link>
              <a href="#how-it-works" className="muted-link">
                Take a closer look <ArrowUpRight className="size-3.5" />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-ui-meta text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Check className="size-3 text-primary" />
                Your team, in sync
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-3 text-primary" />
                Your ideas, in motion
              </span>
            </div>
          </div>
          <div
            className="relative"
            aria-label="Illustrative preview of a ProjectAI workspace"
          >
            <div className="landing-orbit absolute -inset-16 rounded-full border border-primary/5" />
            <div className="absolute -inset-7 rounded-full border border-primary/5" />
            <div className="relative rounded-2xl border border-[#3b4431] bg-[#191d17] p-1.5 shadow-2xl shadow-black/40 lg:-rotate-2">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <span className="size-1.5 rounded-full bg-zinc-600" />
                <span className="size-1.5 rounded-full bg-zinc-600" />
                <span className="size-1.5 rounded-full bg-zinc-600" />
                <span className="mx-auto text-ui-caption text-zinc-500">
                  projectai / your next big thing
                </span>
                <Command className="size-3 text-zinc-600" />
              </div>
              <div className="p-5 sm:p-7">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <span className="text-ui-caption text-zinc-500">
                      WORKSPACE / OVERVIEW
                    </span>
                    <h2 className="mt-2 text-lg font-medium tracking-tight sm:text-xl">
                      Good things are in motion.
                    </h2>
                    <p className="mt-1.5 text-ui-meta text-zinc-500">
                      A clear view of the work that matters.
                    </p>
                  </div>
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-ui-meta text-primary">
                    JD
                  </span>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    ["Projects", "04", "text-primary"],
                    ["In progress", "12", "text-[#e9ba73]"],
                    ["Completed", "28", "text-[#acb9f1]"],
                  ].map(([name, number, color]) => (
                    <div
                      key={name}
                      className="rounded-lg border border-border bg-background/40 p-3"
                    >
                      <p className="text-ui-caption text-zinc-500">{name}</p>
                      <p className={`mt-2 text-2xl font-medium ${color}`}>
                        {number}
                        <span className="ml-2 text-ui-caption text-zinc-400">
                          ↗
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-background/30">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <span className="text-ui-meta font-medium">
                      Website launch
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-ui-caption text-primary">
                      In progress
                    </span>
                  </div>
                  {[
                    ["Map out the big picture", true],
                    ["Give the brand a fresh start", true],
                    ["Build a thoughtful experience", false],
                    ["Share it with the world", false],
                  ].map(([title, done]) => (
                    <div
                      key={String(title)}
                      className="flex items-center gap-2.5 border-b border-white/3 px-4 py-3"
                    >
                      {done ? (
                        <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="size-2.5" />
                        </span>
                      ) : (
                        <Circle className="size-3.5 shrink-0 text-zinc-600" />
                      )}
                      <span
                        className={`text-ui-meta ${done ? "text-zinc-500 line-through" : "text-zinc-300"}`}
                      >
                        {title}
                      </span>
                      <span className="ml-auto size-4 shrink-0 rounded-full bg-[#343b2c]" />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-right text-ui-caption text-zinc-400">
                  Illustrative workspace preview
                </p>
              </div>
            </div>
            <div className="relative -mt-4 ml-8 flex items-center gap-3 rounded-xl border border-primary/30 bg-[#27321e] px-4 py-3 shadow-xl sm:absolute sm:-bottom-6 sm:-left-5 sm:ml-0 sm:max-w-77.5 lg:rotate-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[#27321e]">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-ui-meta font-medium text-primary">
                  A little help from AI
                </p>
                <p className="mt-1 text-ui-caption leading-relaxed text-[#b8c4ac]">
                  From “where do we start?” to a clear next step.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="how-it-works"
          className="border-t border-border bg-[#151815]"
        >
          <div className="mx-auto max-w-[1920px] px-6 py-16 sm:px-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3 text-primary!">
                  Built around your flow
                </p>
                <h2 className="text-3xl font-medium tracking-[-1px]">
                  Less friction. More momentum.
                </h2>
              </div>
              <p className="max-w-xs text-ui-body leading-relaxed text-zinc-500">
                From the first spark to the final checkmark.
                <br />
                One calm place for everything in between.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: Layers,
                  title: "Make space for your ideas",
                  text: "Bring people and projects together in workspaces that keep the bigger picture in view.",
                },
                {
                  number: "02",
                  icon: Workflow,
                  title: "Find your team’s rhythm",
                  text: "Break work into tasks, set priorities, and keep everything moving with a visual project board.",
                },
                {
                  number: "03",
                  icon: Target,
                  title: "Move forward with clarity",
                  text: "Ask AI for a plan, a project summary, or a fresh look at what could be holding your team back.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="rounded-xl border border-border bg-background/40 p-6"
                >
                  <div className="mb-9 flex items-center justify-between">
                    <item.icon className="size-5 text-primary" />
                    <span className="text-ui-meta text-zinc-600">
                      / {item.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-3 text-ui-body leading-[1.85] text-zinc-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="get-started"
          className="mx-auto flex max-w-[1920px] flex-wrap items-center justify-between gap-8 px-6 py-16 sm:px-10"
        >
          <div className="flex items-center gap-4">
            <LayoutGrid className="hidden size-9 text-primary sm:block" />
            <div>
              <h2 className="text-xl font-medium tracking-tight">
                Your next chapter starts with a plan.
              </h2>
              <p className="mt-2 text-ui-body text-zinc-500">
                Give your best ideas a place to grow.
              </p>
            </div>
          </div>
          <Link href={destination} className="btn-primary">
            Let’s get to work <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>
      <LandingFooter authenticated={authenticated} />
    </div>
  );
}
