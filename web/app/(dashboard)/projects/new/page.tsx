"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [useAI, setUseAI] = useState(false);
  
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
      <p className="text-slate-400 mb-8">Set up a new project in your workspace.</p>

      <div className="glass-card p-8 rounded-2xl">
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Project Name</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="e.g. Website Redesign"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Workspace</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all appearance-none">
              <option value="1">Engineering Team</option>
              <option value="2">Marketing</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
              placeholder="Briefly describe what this project is about..."
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-indigo-500/50 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <div className="flex-1">
                <div className="font-medium text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate project plan with AI
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  AI will analyze your description and suggest project phases, tasks, and structure.
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
              {useAI ? "Generate Plan" : "Create Project"}
              {useAI && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
