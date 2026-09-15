"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard, Zap } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />
      
      <header className="flex items-center justify-between px-8 py-6 z-10 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">ProjectAI</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/projects" className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center z-10 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>The future of project management is here</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Manage projects effortlessly with <span className="text-gradient">AI assistance</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          ProjectAI combines standard project management tools with intelligent AI to help you plan, track, and complete your work faster than ever before.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register" className="flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]">
            Start Planning Now
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-full glass hover:bg-white/10 text-white font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-indigo-400" />}
            title="AI Project Planning"
            description="Describe your idea and let AI generate a structured project plan with phases and tasks instantly."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-fuchsia-400" />}
            title="Risk Detection"
            description="Our AI continuously analyzes your project progress to detect bottlenecks and overdue risks before they become problems."
          />
          <FeatureCard 
            icon={<LayoutDashboard className="w-6 h-6 text-emerald-400" />}
            title="Real-time Collaboration"
            description="Work together seamlessly with real-time updates, kanban boards, and task assignments."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 rounded-2xl flex flex-col gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
