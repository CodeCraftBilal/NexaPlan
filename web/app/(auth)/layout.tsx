import React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left side - Branding */}
      <div className="flex-1 bg-blue-600 flex flex-col justify-center items-center text-white p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-blue-600 to-blue-800"></div>
        <div className="relative z-10 max-w-md text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
            <div className="bg-white p-2 rounded-xl">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Project Manager</h1>
          </div>
          <p className="text-blue-100 text-lg mb-8">
            Manage your projects intelligently. Generate tasks, summarize insights, and boost your team's productivity.
          </p>
        </div>
      </div>
      
      {/* Right side - Auth Form */}
      <div className="flex-[1.5] flex items-center justify-center p-8 bg-white shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.1)] relative z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
