"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, ArrowUpRight, Menu, X, Layers, Plus, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { initializeAuth } from "@/lib/auth-session";
import { Brand } from "@/components/brand";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My tasks", href: "/my-tasks", icon: CheckSquare },
  { label: "Workspaces", href: "/workspaces", icon: Layers },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, sessionError, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!isLoading && !sessionError && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname + window.location.search)}`);
  }, [isAuthenticated, isLoading, pathname, router, sessionError]);

  async function handleLogout() {
    setSigningOut(true); setLogoutError("");
    try { await api.post("/auth/logout"); logout(); router.replace("/login"); router.refresh(); }
    catch { setLogoutError("Could not sign out. Please try again."); }
    finally { setSigningOut(false); }
  }

  if (sessionError) return <div className="flex min-h-screen items-center justify-center p-6"><div className="panel max-w-md p-8 text-center"><Brand /><h1 className="mt-8 text-xl font-semibold">Let’s reconnect</h1><p role="alert" className="my-4 text-sm text-zinc-400">{sessionError}</p><button className="btn-primary" onClick={() => void initializeAuth()}>Try again</button></div></div>;
  if (isLoading || !isAuthenticated) return <div role="status" className="flex min-h-screen flex-col items-center justify-center gap-5"><Brand /><Loader2 className="size-5 animate-spin text-primary" /><span className="text-xs text-zinc-500">Opening your workspace…</span></div>;

  const activeLabel = navItems.find(item => pathname.startsWith(item.href))?.label || "Workspace";
  return (
    <div className="flex min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-black">Skip to content</a>
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/65 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col overflow-y-auto pt-5 border-r border-border bg-[#151815] transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[84px] items-center justify-between px-6"><Brand href="/dashboard" /><button aria-label="Close navigation" className="text-zinc-400 lg:hidden" onClick={() => setMobileOpen(false)}><X className="size-5" /></button></div>
        <div className="px-4"><Link onClick={() => setMobileOpen(false)} href="/workspaces" className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3"><span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{user?.name?.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">My workspace</span><span className="mt-0.5 block text-[10px] text-zinc-500">Make room for great work</span></span><ChevronRight className="size-3.5 text-zinc-500" /></Link></div>
        <nav aria-label="Main navigation" className="mt-12 px-4"><p className="eyebrow mb-3 px-3">Workspace</p><div className="space-y-1">{navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}><Icon className="size-[18px]" />{item.label}{active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}</Link>;
        })}</div></nav>
        <div className="mt-auto p-4"><div className="relative overflow-hidden rounded-xl border border-primary/15 bg-[#1d2518] p-4"><Sparkles className="mb-3 size-5 text-primary" /><p className="text-sm font-medium">A little clarity. A lot of progress.</p><p className="mt-2 text-xs leading-relaxed text-zinc-400">Turn your next big idea into a plan with AI.</p><Link onClick={() => setMobileOpen(false)} href="/projects/new" className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">Start a project <ArrowUpRight className="size-3.5" /></Link></div></div>
        <div className="border-t border-border p-4"><div className="flex items-center gap-3 px-1"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#32392a] text-xs font-semibold text-primary">{user?.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{user?.name}</p><p className="mt-1 truncate text-[10px] text-zinc-500">{user?.email}</p></div><button disabled={signingOut} aria-label="Sign out" title="Sign out" onClick={handleLogout} className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white">{signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}</button></div>{logoutError && <p role="alert" className="mt-3 text-xs text-danger">{logoutError}</p>}</div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-[240px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-border bg-background/95 px-5 backdrop-blur-md sm:px-8"><div className="flex items-center gap-3"><button aria-label="Open navigation" aria-expanded={mobileOpen} className="rounded-lg p-2 text-zinc-400 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button><span className="hidden text-xs text-zinc-500 sm:inline">Workspace</span><ChevronRight className="hidden size-3 text-zinc-600 sm:block" /><span className="text-xs font-medium">{activeLabel}</span></div><div className="flex items-center gap-5"><span className="hidden items-center gap-2 text-[11px] text-zinc-500 md:flex"><span className="size-1.5 rounded-full bg-primary" />Let’s make progress</span><Link href="/projects/new" className="btn-secondary !min-h-8 !px-3 !py-2 !text-xs"><Plus className="size-3.5" />New project</Link></div></header>
        <main id="main-content" className="mx-auto max-w-[1520px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10">{children}</main>
      </div>
    </div>
  );
}

