"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Settings, Plus, FolderKanban } from "lucide-react";
import Link from "next/link";

export default function WorkspaceOverviewPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  
  // Mock data for UI development
  const workspace = {
    id: workspaceId,
    name: "Engineering Team",
    description: "Frontend and Backend development",
    members: [{ id: "1", user: { name: "Bilal Khan", email: "bilal@example.com" } }],
    projects: [
      { id: "101", name: "Web App Refactor", status: "ACTIVE", priority: "HIGH" },
      { id: "102", name: "Mobile App MVP", status: "PLANNING", priority: "MEDIUM" }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl">
            {workspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{workspace.name}</h1>
            <p className="text-slate-400 mt-1">{workspace.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
            <Users className="w-4 h-4" />
            Members
          </button>
          <button className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 text-white rounded-lg font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="border-t border-white/5 my-8"></div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            Projects
          </h2>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspace.projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="glass hover:border-indigo-500/30 transition-all p-5 rounded-xl flex flex-col group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="px-2 py-1 rounded bg-white/5 text-xs font-medium text-slate-300">
                    {project.status}
                  </span>
                  <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-medium">
                    {project.priority}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
