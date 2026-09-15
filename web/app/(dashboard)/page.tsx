"use client";

import { useAuthStore } from "@/stores/authStore";
import { FolderKanban, CheckSquare, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const data = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 7 },
    { name: 'Wed', completed: 5 },
    { name: 'Thu', completed: 11 },
    { name: 'Fri', completed: 8 },
    { name: 'Sat', completed: 3 },
    { name: 'Sun', completed: 2 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Good morning, {user?.name || "Bilal"}!</h1>
        <p className="text-slate-400 mt-1">Here is what's happening across your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<FolderKanban className="text-indigo-400" />} title="Active Projects" value="4" />
        <StatCard icon={<CheckSquare className="text-emerald-400" />} title="Tasks Completed" value="31" trend="+12% this week" />
        <StatCard icon={<Clock className="text-amber-400" />} title="Pending Tasks" value="18" />
        <StatCard icon={<AlertTriangle className="text-rose-400" />} title="Overdue" value="3" trend="Needs attention" isAlert />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Velocity</h2>
            <select className="bg-white/5 border border-white/10 rounded-md text-sm text-slate-300 px-3 py-1.5 focus:outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e212b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* My Tasks Widget */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">My Tasks</h2>
            <Link href="/my-tasks" className="text-sm text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="space-y-4 flex-1">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                <div className={`mt-0.5 w-4 h-4 rounded border ${i === 1 ? 'border-rose-500 bg-rose-500/10' : 'border-slate-500'}`} />
                <div>
                  <h4 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Fix authentication bug</h4>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span className={i === 1 ? 'text-rose-400' : ''}>{i === 1 ? 'Overdue by 1 day' : 'Due tomorrow'}</span>
                    <span>•</span>
                    <span>Web App</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/my-tasks" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
            Go to My Tasks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, isAlert }: any) {
  return (
    <div className={`glass-card p-6 rounded-2xl border-l-4 ${isAlert ? 'border-l-rose-500' : 'border-l-transparent border-white/5'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-400">{title}</div>
      {trend && (
        <div className={`text-xs mt-3 font-medium ${isAlert ? 'text-rose-400' : 'text-emerald-400'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
