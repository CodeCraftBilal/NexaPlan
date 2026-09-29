"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  ArrowUpRight,
  X,
  Layers,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Brand } from "@/components/brand";

export const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My tasks", href: "/my-tasks", icon: CheckSquare },
  { label: "Workspaces", href: "/workspaces", icon: Layers },
];

interface SideMenuBarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function SideMenuBar({ mobileOpen, setMobileOpen }: SideMenuBarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function handleLogout() {
    setSigningOut(true);
    setLogoutError("");
    try {
      await api.post("/auth/logout");
      logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/65 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-65 flex-col overflow-y-auto pt-5 border-r border-border bg-[#151815] transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-21 items-center justify-between px-6">
          <Brand href="/dashboard" />
          <button
            aria-label="Close navigation"
            className="text-zinc-400 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-4">
          <Link
            onClick={() => setMobileOpen(false)}
            href="/workspaces"
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 mt-5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-ui-body font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-ui-label font-semibold">
                My workspace
              </span>
              <span className="mt-0.5 block text-ui-caption text-zinc-400">
                Make room for great work
              </span>
            </span>
            <ChevronRight className="size-3.5 shrink-0 text-zinc-500" />
          </Link>
        </div>
        <nav aria-label="Main navigation" className="mt-12 px-4">
          <p className="eyebrow mb-3 px-3">Workspace</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-ui-label font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="size-4.5" />
                  {item.label}
                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-[#1d2518] p-4">
            <Sparkles className="mb-3 size-5 text-primary" />
            <p className="text-ui-body font-medium">
              A little clarity. A lot of progress.
            </p>
            <p className="mt-2 text-ui-label leading-relaxed text-zinc-400">
              Turn your next big idea into a plan with AI.
            </p>
            <Link
              onClick={() => setMobileOpen(false)}
              href="/projects/new"
              className="mt-4 flex items-center gap-2 text-ui-label font-semibold text-primary"
            >
              Start a project <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 px-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#32392a] text-ui-label font-semibold text-primary">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-ui-label font-medium">{user?.name}</p>
              <p className="mt-1 truncate text-ui-meta text-zinc-500">
                {user?.email}
              </p>
            </div>
            <button
              disabled={signingOut}
              aria-label="Sign out"
              title="Sign out"
              onClick={handleLogout}
              className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              {signingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
            </button>
          </div>
          {logoutError && (
            <p role="alert" className="mt-3 text-ui-label text-danger">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
