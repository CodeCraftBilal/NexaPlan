"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, KanbanSquare, Activity, Sparkles, Plus, ArrowRight } from "lucide-react";

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.projectId;

  const project = {
    name: "Web App Refactor",
    description: "Modernize legacy codebase with React and Next.js",
    status: "ACTIVE",
    progress: 68,
    stats: {
      total: 45,
      completed: 31,
      inProgress: 8,
      overdue: 2
    }
  };

  const tabs = [
    { name: "Overview", href: `/projects/${projectId}`, icon: LayoutDashboard, active: true },
    { name: "List", href: `/projects/${projectId}/tasks`, icon: CheckSquare, active: false },
    { name: "Board", href: `/projects/${projectId}/board`, icon: KanbanSquare, active: false },
    { name: "AI Assistant", href: `/projects/${projectId}/ai`, icon: Sparkles, active: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold text-slate-300 tracking-wider uppercase">
                {project.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{project.name}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{project.description}</p>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-white/5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                  tab.active 
                    ? "border-indigo-500 text-indigo-400" 
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-6">Project Progress</h2>
            <div className="flex items-end justify-between mb-2">
              <span className="text-4xl font-extrabold text-white">{project.progress}%</span>
              <span className="text-sm font-medium text-slate-400">{project.stats.completed} of {project.stats.total} tasks completed</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          
          {/* Recent Tasks Mock */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Tasks</h2>
              <Link href={`/projects/${projectId}/tasks`} className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border border-slate-500" />
                    <span className="text-sm font-medium text-slate-200">Task {i} implementation</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400">TODO</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border-indigo-500/20">
            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-bold">AI Insight</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Project is on track. 2 high-priority tasks are due this week. I recommend focusing on the Authentication module next as it blocks 3 other tasks.
            </p>
            <Link href={`/projects/${projectId}/ai`} className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Open AI Assistant <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <div className="text-2xl font-bold text-white mb-1">{project.stats.inProgress}</div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">In Progress</div>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-2xl font-bold text-rose-400 mb-1">{project.stats.overdue}</div>
                <div className="text-xs font-medium text-rose-400 uppercase tracking-wider">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
