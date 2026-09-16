"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Circle, CircleAlert, FolderKanban, KanbanSquare, LayoutGrid, List, Loader2, Plus, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, label } from "@/lib/project-data";
import type { ApiResponse, Project, Task, TaskStatus, Priority } from "@/lib/types";

export const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "BLOCKED", "CANCELLED"];
export const statusColors: Record<TaskStatus, string> = { TODO: "#93998d", IN_PROGRESS: "#c8f36a", IN_REVIEW: "#e3c989", COMPLETED: "#83b49c", BLOCKED: "#e79b88", CANCELLED: "#686e65" };

export function LoadingState() {
  return <div role="status" aria-label="Loading" className="space-y-5 animate-pulse"><div className="h-10 w-64 rounded-xl bg-surface" /><div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map((n) => <div key={n} className="h-56 rounded-2xl border border-border bg-surface" />)}</div><span className="sr-only">Loading your workspace…</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e79b88]/25 bg-[#e79b88]/5 p-4 text-sm text-[#e7b0a1]"><CircleAlert size={18} className="shrink-0" /><p className="flex-1">{message}</p>{onRetry && <button className="underline underline-offset-4" onClick={onRetry}>Try again</button>}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="panel flex flex-col items-center px-6 py-16 text-center"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-primary"><FolderKanban size={25} strokeWidth={1.5} /></div><h2 className="text-xl font-semibold tracking-tight">{title}</h2><p className="mb-6 mt-2 max-w-md text-sm leading-6 text-[#93998d]">{description}</p>{action}</div>;
}

export function Badge({ value }: { value: string }) {
  const color = value === "URGENT" || value === "BLOCKED" ? "text-[#e7a18d] bg-[#e7a18d]/10" : value === "HIGH" || value === "IN_REVIEW" ? "text-[#ddc68a] bg-[#ddc68a]/10" : value === "ACTIVE" || value === "COMPLETED" || value === "IN_PROGRESS" ? "text-primary bg-primary/10" : "text-[#a9afa4] bg-[#a9afa4]/10";
  return <span className={`inline-flex shrink-0 items-center rounded-md px-2 py-1 text-[11px] font-medium ${color}`}>{label(value)}</span>;
}

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return <Link href={`/projects/${project.id}`} className="panel group flex h-full flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-[#606c50]">
    <div className="mb-6 flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-primary"><FolderKanban size={21} strokeWidth={1.6} /></div><span className="font-mono text-xs text-[#686e65]">{String(index + 1).padStart(2, "0")}</span></div>
    <div className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-[#868e7d]">{project.workspace?.name || "Project"}</div><h2 className="flex items-center justify-between gap-3 text-lg font-semibold tracking-tight group-hover:text-primary">{project.name}<ArrowUpRight size={17} className="shrink-0 text-[#686e65] transition group-hover:text-primary" /></h2>
    <p className="mb-6 mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#93998d]">{project.description || "A fresh space for your next big idea."}</p>
    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4"><Badge value={project.status} />{project._count ? <span className="text-xs text-[#93998d]">{project._count.tasks} tasks · {project._count.members} members</span> : <Badge value={project.priority} />}</div>
  </Link>;
}

export function ProjectHeader({ project, action }: { project: Project; action?: ReactNode }) {
  const pathname = usePathname();
  const base = `/projects/${project.id}`;
  const tabs = [{ label: "Overview", href: base, icon: LayoutGrid }, { label: "Task list", href: `${base}/tasks`, icon: List }, { label: "Board", href: `${base}/board`, icon: KanbanSquare }, { label: "AI assistant", href: `${base}/ai`, icon: Sparkles }];
  return <div className="space-y-6"><Link href="/projects" className="inline-flex items-center gap-2 text-xs text-[#93998d] hover:text-foreground"><ArrowLeft size={14} />All projects</Link><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><div className="mb-3 flex items-center gap-3"><p className="eyebrow">{project.workspace?.name || "Project workspace"}</p><Badge value={project.status} /></div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#93998d]">{project.description || "Bring your team, tasks, and ideas together."}</p></div>{action}</div><nav aria-label="Project navigation" className="flex gap-5 overflow-x-auto border-b border-border sm:gap-8">{tabs.map((tab) => <Link key={tab.href} href={tab.href} aria-current={pathname === tab.href ? "page" : undefined} className={`flex shrink-0 items-center gap-2 border-b-2 pb-4 text-sm transition ${pathname === tab.href ? "border-primary text-primary" : "border-transparent text-[#93998d] hover:text-foreground"}`}><tab.icon size={16} />{tab.label}</Link>)}</nav></div>;
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([api.get<ApiResponse<Project>>(`/projects/${projectId}`), api.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`)])
      .then(([projectResponse, taskResponse]) => { if (active) { setProject(projectResponse.data.data); setTasks(taskResponse.data.data); setError(""); } })
      .catch((error) => { if (active) setError(errorMessage(error, "We couldn't load this project.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId, version]);
  return { project, tasks, setTasks, error, setError, loading, retry: () => { setLoading(true); setVersion((n) => n + 1); } };
}

export function TaskComposer({ project, initialStatus = "TODO", onCreated, onClose }: { project: Project; initialStatus?: TaskStatus; onCreated: (task: Task) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const response = await api.post<ApiResponse<Task>>("/tasks", { title: title.trim(), description: description.trim(), projectId: project.id, priority, status: initialStatus, ...(assigneeId && { assigneeId }) });
      const assignee = project.members?.find((member) => member.userId === assigneeId)?.user;
      onCreated({ ...response.data.data, assignee }); onClose();
    } catch (error) { setError(errorMessage(error, "We couldn't create this task.")); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="panel space-y-5 border-primary/30 p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Add a task</h2><button type="button" aria-label="Close task form" onClick={onClose} className="text-[#93998d] hover:text-foreground"><X size={18} /></button></div>{error && <ErrorState message={error} />}<div><label htmlFor="task-title" className="mb-2 block text-xs font-medium text-[#b1b7a9]">Task name</label><input autoFocus id="task-title" required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} className="field w-full" placeholder="What needs to get done?" /></div><div><label htmlFor="task-description" className="mb-2 block text-xs font-medium text-[#b1b7a9]">Description <span className="text-[#686e65]">(optional)</span></label><textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} className="field w-full resize-y" rows={2} placeholder="Add some context for your team…" /></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="task-priority" className="mb-2 block text-xs font-medium text-[#b1b7a9]">Priority</label><select id="task-priority" className="field w-full" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></div><div><label htmlFor="task-assignee" className="mb-2 block text-xs font-medium text-[#b1b7a9]">Assignee</label><select id="task-assignee" className="field w-full" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}><option value="">Unassigned</option>{project.members?.map((member) => <option key={member.id} value={member.userId}>{member.user.name}</option>)}</select></div></div><div className="flex justify-end gap-3"><button type="button" onClick={onClose} disabled={busy} className="btn-secondary">Cancel</button><button disabled={busy || !title.trim()} className="btn-primary">{busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{busy ? "Creating…" : "Create task"}</button></div></form>;
}

export function TaskRow({ task, onStatus, busy = false, showProject = false }: { task: Task; onStatus: (task: Task, status: TaskStatus) => void; busy?: boolean; showProject?: boolean }) {
  return <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 last:border-0 hover:bg-surface-hover/40 sm:px-6"><button aria-label={task.status === "COMPLETED" ? `Reopen ${task.title}` : `Complete ${task.title}`} disabled={busy} onClick={() => onStatus(task, task.status === "COMPLETED" ? "TODO" : "COMPLETED")} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${task.status === "COMPLETED" ? "border-primary bg-primary text-background" : "border-[#555e4e] text-transparent hover:border-primary hover:text-primary"}`}>{busy ? <Loader2 size={12} className="animate-spin text-[#93998d]" /> : <Check size={13} />}</button><div className="min-w-0 flex-1"><p className={`text-sm font-medium ${task.status === "COMPLETED" ? "text-[#868e7d] line-through" : "text-foreground"}`}>{task.title}</p>{showProject && task.project && <Link href={`/projects/${task.projectId}`} className="mt-1 inline-block text-xs text-[#93998d] hover:text-primary">{task.project.name}</Link>}</div><div className="ml-8 flex items-center gap-3 sm:ml-0"><Badge value={task.priority} /><select aria-label={`Status of ${task.title}`} value={task.status} disabled={busy} onChange={(e) => onStatus(task, e.target.value as TaskStatus)} className="max-w-32 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-[#b1b7a9] focus:outline-primary">{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select>{task.assignee && <span title={task.assignee.name} className="hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-hover text-[10px] text-[#b1b7a9] sm:flex">{task.assignee.name.slice(0, 2).toUpperCase()}</span>}</div></div>;
}

export function Stat({ title, value, caption }: { title: string; value: number | string; caption: string }) {
  return <div className="panel px-5 py-5"><p className="mb-4 flex items-center gap-2 text-xs text-[#93998d]"><Circle size={7} fill="currentColor" />{title}</p><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-[#686e65]">{caption}</p></div>;
}
