"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, LayoutDashboard, Settings } from "lucide-react";
import { api } from "@/lib/api";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We will fetch real data later, mock for now to show UI
    setTimeout(() => {
      setWorkspaces([
        { id: "1", name: "Engineering Team", description: "Frontend and Backend development", _count: { projects: 3, members: 8 } },
        { id: "2", name: "Marketing", description: "Campaigns and SEO", _count: { projects: 1, members: 4 } },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Workspaces</h1>
          <p className="text-slate-400 mt-1">Manage your teams and organizations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/workspaces/${workspace.id}`}>
              <div className="glass-card hover:border-indigo-500/50 transition-all p-6 rounded-xl flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </div>
                  <button className="text-slate-500 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                  {workspace.name}
                </h3>
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-2">
                  {workspace.description || "No description"}
                </p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{workspace._count.projects} Projects</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{workspace._count.members} Members</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
