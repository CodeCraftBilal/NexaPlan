"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, Plus, Search } from "lucide-react";
import { fetchProjects, errorMessage } from "@/lib/project-data";
import type { Project } from "@/lib/types";
import { EmptyState, ErrorState, LoadingState, ProjectCard } from "@/components/project-ui";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    fetchProjects().then((data) => { if (active) { setProjects(data); setError(""); } }).catch((error) => { if (active) setError(errorMessage(error, "We couldn't load your projects.")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [version]);
  const filtered = projects.filter((project) => `${project.name} ${project.description || ""} ${project.workspace?.name || ""}`.toLowerCase().includes(query.toLowerCase()) && (filter === "ALL" || project.status === filter));
  return <div className="page-enter mx-auto max-w-7xl space-y-8">
    <div className="page-header"><div><p className="eyebrow mb-3">Make great things happen</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your projects<span className="text-primary">.</span></h1><p className="mt-3 text-sm text-[#93998d]">Every initiative. One clear view.</p></div><Link href="/projects/new" className="btn-primary"><Plus size={17} />New project</Link></div>
    <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row"><div className="flex flex-wrap items-center gap-2">{[{ id: "ALL", name: "All projects" }, { id: "ACTIVE", name: "Active" }, { id: "PLANNING", name: "Planning" }, { id: "COMPLETED", name: "Completed" }].map((tab) => <button key={tab.id} onClick={() => setFilter(tab.id)} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${filter === tab.id ? "bg-surface-hover text-foreground" : "text-[#93998d] hover:text-foreground"}`}>{tab.name}{tab.id === "ALL" && <span className="ml-2 rounded bg-background px-1.5 py-0.5 text-[10px] text-[#93998d]">{projects.length}</span>}</button>)}</div><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#686e65]" /><input aria-label="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects…" className="field w-full !py-2 !pl-9 text-xs sm:w-60" /></div></div>
    {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={() => { setLoading(true); setVersion((n) => n + 1); }} /> : projects.length === 0 ? <EmptyState title="Your next big thing starts here" description="Create a workspace, bring your team together, and turn your ideas into a project." action={<Link href="/projects/new" className="btn-primary"><Plus size={16} />Create your first project</Link>} /> : filtered.length === 0 ? <EmptyState title="No matching projects" description="Try another search or switch the project status above." /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}<Link href="/projects/new" className="group flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center transition hover:border-primary/50 hover:bg-primary/[.02]"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border text-[#93998d] group-hover:text-primary"><Plus size={20} /></div><p className="text-sm font-medium">Start something new</p><p className="mt-2 text-xs text-[#686e65]">Make room for your next idea</p></Link></div>}
    <div className="flex items-center gap-2 text-xs text-[#686e65]"><FolderKanban size={14} /><span>Organized by workspace. Built for momentum.</span><Link href="/workspaces" className="ml-auto inline-flex items-center gap-1 text-[#93998d] hover:text-primary">Workspaces<ArrowUpRight size={14} /></Link></div>
  </div>;
}
