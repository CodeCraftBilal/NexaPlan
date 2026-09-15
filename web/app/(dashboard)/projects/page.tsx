"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, MoreVertical, LayoutDashboard, Clock } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setProjects([
        { id: "101", name: "Web App Refactor", description: "Modernize legacy codebase", status: "ACTIVE", priority: "HIGH", workspace: { name: "Engineering Team" }, _count: { tasks: 45, members: 4 } },
        { id: "102", name: "Mobile App MVP", description: "Initial release for iOS", status: "PLANNING", priority: "MEDIUM", workspace: { name: "Engineering Team" }, _count: { tasks: 12, members: 3 } },
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-slate-400 mt-1">Manage all your ongoing projects</p>
        </div>
        <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="glass-card hover:border-indigo-500/50 transition-all p-6 rounded-xl flex flex-col h-full group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <button className="text-slate-500 hover:text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <FolderKanban className="w-5 h-5" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2 h-10">
                  {project.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-medium text-slate-300 tracking-wide uppercase">
                    {project.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-[11px] font-medium text-indigo-400 tracking-wide uppercase">
                    {project.priority}
                  </span>
                </div>
                
                <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{project.workspace.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>{project._count.tasks} tasks</span>
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

function CheckSquare(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  );
}
