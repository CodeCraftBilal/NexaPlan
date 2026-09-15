"use client";

import { useState } from "react";
import { CheckSquare, Search, MoreHorizontal, Filter } from "lucide-react";

export default function MyTasksPage() {
  const [tasks] = useState([
    { id: 1, title: "Review pull requests", project: "Web App Refactor", priority: "HIGH", status: "TODO", dueDate: "Today" },
    { id: 2, title: "Design mobile app icon", project: "Mobile App MVP", priority: "MEDIUM", status: "IN_PROGRESS", dueDate: "Tomorrow" },
    { id: 3, title: "Write API documentation", project: "Web App Refactor", priority: "LOW", status: "TODO", dueDate: "Next week" },
    { id: 4, title: "Fix authentication bug", project: "Web App Refactor", priority: "URGENT", status: "TODO", dueDate: "Overdue" },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Tasks</h1>
          <p className="text-slate-400 mt-1">Work assigned to you across all projects</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search my tasks..." 
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-sm font-medium transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          <div className="text-sm font-medium text-slate-400">
            {tasks.length} tasks
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center gap-4 group cursor-pointer">
              <div className="w-5 h-5 rounded border border-slate-500 flex-shrink-0 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                <CheckSquare className="w-3.5 h-3.5 text-transparent group-hover:text-indigo-400/50" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-200 truncate">{task.title}</h4>
                <div className="text-xs text-slate-500 mt-1">{task.project}</div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                  task.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' :
                  task.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                  task.priority === 'MEDIUM' ? 'bg-indigo-500/10 text-indigo-400' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {task.priority}
                </span>
                
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  task.dueDate === 'Overdue' ? 'text-rose-400 bg-rose-500/10' :
                  task.dueDate === 'Today' ? 'text-amber-400 bg-amber-500/10' :
                  'text-slate-400 bg-white/5'
                }`}>
                  {task.dueDate}
                </span>

                <button className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
