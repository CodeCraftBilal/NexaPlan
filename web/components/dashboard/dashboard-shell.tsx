"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Plus, ChevronRight, Loader2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { initializeAuth } from "@/lib/auth-session";
import { SideMenuBar, navItems } from "@/components/dashboard/side-menu-bar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, sessionError } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !sessionError && !isAuthenticated)
      router.replace(
        `/login?next=${encodeURIComponent(pathname + window.location.search)}`,
      );
  }, [isAuthenticated, isLoading, pathname, router, sessionError]);

  if (sessionError)
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="panel max-w-md p-8 text-center">
          <Brand />
          <h1 className="mt-8 text-xl font-semibold">Let’s reconnect</h1>
          <p role="alert" className="my-4 text-ui-body text-zinc-400">
            {sessionError}
          </p>
          <button className="btn-primary" onClick={() => void initializeAuth()}>
            Try again
          </button>
        </div>
      </div>
    );
  if (isLoading || !isAuthenticated)
    return (
      <div
        role="status"
        className="flex min-h-screen flex-col items-center justify-center gap-5"
      >
        <Brand />
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-ui-label text-zinc-500">
          Opening your workspace…
        </span>
      </div>
    );

  const activeLabel =
    navItems.find((item) => pathname.startsWith(item.href))?.label ||
    "Workspace";

  return (
    <div className="flex min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-black"
      >
        Skip to content
      </a>

      <SideMenuBar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="min-w-0 flex-1 lg:ml-60">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between gap-3 border-b border-border bg-background/95 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-zinc-400 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <span className="hidden text-ui-label text-zinc-500 sm:inline">
              Workspace
            </span>
            <ChevronRight className="hidden size-3 text-zinc-600 sm:block" />
            <span className="text-ui-label font-medium">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden items-center gap-2 text-ui-meta text-zinc-500 md:flex">
              <span className="size-1.5 rounded-full bg-primary" />
              Let’s make progress
            </span>
            <Link
              href="/projects/new"
              className="btn-secondary min-h-8! px-3! py-2! text-ui-label!"
            >
              <Plus className="size-3.5" />
              New project
            </Link>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-380 px-5 py-7 sm:px-8 sm:py-9 xl:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
