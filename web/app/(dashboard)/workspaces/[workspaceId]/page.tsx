"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FolderKanban, Plus, Users } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { errorMessage, label } from "@/lib/project-data";
import type { ApiResponse, Workspace } from "@/lib/types";
import { EmptyState, ErrorState, LoadingState, ProjectCard } from "@/components/project-ui";

export default function WorkspaceOverviewPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    api.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`).then((response) => { if (active) { setWorkspace(response.data.data); setError(""); } }).catch((error) => { if (active) setError(errorMessage(error, "We couldn't load this workspace.")); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [workspaceId, version]);
  if (loading) return <LoadingState />;
  if (error || !workspace) return <ErrorState message={error || "Workspace unavailable."} onRetry={() => { setLoading(true); setVersion((n) => n + 1); }} />;
  return <div className="page-enter mx-auto max-w-7xl space-y-8"><Link href="/workspaces" className="inline-flex items-center gap-2 text-xs text-[#93998d] hover:text-foreground"><ArrowLeft size={14} />All workspaces</Link><div className="page-header"><div className="flex items-center gap-5"><div className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-xl font-semibold text-primary sm:flex">{workspace.name.slice(0, 2).toUpperCase()}</div><div><p className="eyebrow mb-2">Workspace overview</p><h1 className="text-3xl font-semibold tracking-tight">{workspace.name}</h1><p className="mt-2 text-sm text-[#93998d]">{workspace.description || "A shared space for your team’s best work."}</p></div></div><Link href={`/projects/new?workspace=${workspace.id}`} className="btn-primary"><Plus size={16} />New project</Link></div>
    <div className="grid items-start gap-7 xl:grid-cols-[1fr_300px]"><section className="space-y-5"><div className="flex items-center gap-2 border-b border-border pb-4"><FolderKanban size={17} className="text-primary" /><h2 className="text-sm font-semibold">Projects</h2><span className="ml-1 text-xs text-[#686e65]">{workspace.projects?.length || 0}</span></div>{workspace.projects?.length ? <div className="grid gap-5 md:grid-cols-2">{workspace.projects.map((project, index) => <ProjectCard key={project.id} project={{ ...project, workspace: { name: workspace.name } }} index={index} />)}</div> : <EmptyState title="Make your first move" description="Start a project to give your team's work a clear direction." action={<Link href={`/projects/new?workspace=${workspace.id}`} className="btn-primary"><Plus size={16} />Create project</Link>} />}</section><aside className="panel p-5"><div className="mb-6 flex items-center gap-2"><Users size={16} className="text-[#93998d]" /><h2 className="text-sm font-semibold">Your team</h2><span className="ml-auto text-xs text-[#686e65]">{workspace.members?.length || 0}</span></div><div className="space-y-5">{workspace.members?.map((member) => <div key={member.id} className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-hover text-xs text-[#c5cbbd]">{member.user.name.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{member.user.name}</p><p className="mt-0.5 text-xs text-[#93998d]">{label(member.role)}</p></div></div>)}</div><p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-[#686e65]">Great work happens together. Everyone in this space can stay close to the work.</p></aside></div>
  </div>;
}
