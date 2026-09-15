"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, CheckSquare, Bell, Settings, LogOut, ChevronDown } from "lucide-react";
import clsx from "clsx";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Wait, for MVP we can skip strict client-side redirect if not authenticated 
  // since we don't have a real login API yet, but let's mock it.
  
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Workspaces", href: "/workspaces", icon: FolderKanban },
    { label: "Projects", href: "/projects", icon: FolderKanban },
    { label: "My Tasks", href: "/my-tasks", icon: CheckSquare },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface/30 backdrop-blur-md flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center">
              <span className="text-xs">AI</span>
            </div>
            ProjectAI
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-slate-300">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate text-white">{user?.name || "User"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Breadcrumbs or Context Title could go here */}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
