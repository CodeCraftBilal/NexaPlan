"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckSquare,
  KanbanSquare,
  Sparkles,
  Send,
  Bot,
  User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIAssistantPage() {
  const params = useParams();
  const projectId = params.projectId;

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI Project Assistant. I've analyzed your project 'Web App Refactor'.\n\nI can help you:\n- Summarize project progress\n- Detect risks and bottlenecks\n- Generate new tasks\n- Prioritize your backlog\n\nHow can I help you today?",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Based on the current project status, here is a risk analysis:\n\n**High Risk**: Authentication module is blocked.\n\nI suggest prioritizing the 'Fix OAuth callback' task. Would you like me to create subtasks for this?",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const tabs = [
    {
      name: "Overview",
      href: `/projects/${projectId}`,
      icon: LayoutDashboard,
      active: false,
    },
    {
      name: "List",
      href: `/projects/${projectId}/tasks`,
      icon: CheckSquare,
      active: false,
    },
    {
      name: "Board",
      href: `/projects/${projectId}/board`,
      icon: KanbanSquare,
      active: false,
    },
    {
      name: "AI Assistant",
      href: `/projects/${projectId}/ai`,
      icon: Sparkles,
      active: true,
    },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            AI Assistant
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5 flex-shrink-0">
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

      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border-indigo-500/20">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-600"
                    : "bg-gradient-to-br from-indigo-500 to-fuchsia-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex gap-1 items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the AI assistant anything about this project..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
