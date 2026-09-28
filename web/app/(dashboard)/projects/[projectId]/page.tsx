"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, label } from "@/lib/project-data";
import type { Task, TaskStatus } from "@/lib/types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ProjectHeader,
  Stat,
  TaskComposer,
  TaskRow,
  useProject,
} from "@/components/project-ui";

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, tasks, setTasks, error, setError, loading, retry } =
    useProject(projectId);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  async function updateStatus(task: Task, status: TaskStatus) {
    setBusy(task.id);
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      setTasks((items) =>
        items.map((item) => (item.id === task.id ? { ...item, status } : item)),
      );
      setError("");
    } catch (error) {
      setError(errorMessage(error, "We couldn't update this task."));
    } finally {
      setBusy(null);
    }
  }
  if (loading) return <LoadingState />;
  if (!project)
    return (
      <ErrorState message={error || "Project unavailable."} onRetry={retry} />
    );
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;
  const blocked = tasks.filter((task) => task.status === "BLOCKED").length;
  return (
    <div className="page-enter mx-auto max-w-7xl space-y-7">
      <ProjectHeader
        project={project}
        action={
          <button
            className="btn-primary shrink-0"
            onClick={() => setCreating(true)}
          >
            <Plus size={16} />
            Add task
          </button>
        }
      />
      {error && <ErrorState message={error} />}
      {creating && (
        <TaskComposer
          project={project}
          onCreated={(task) => setTasks((items) => [task, ...items])}
          onClose={() => setCreating(false)}
        />
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          title="Total tasks"
          value={tasks.length}
          caption="Everything in this project"
        />
        <Stat
          title="Completed"
          value={completed}
          caption="One step closer to the goal"
        />
        <Stat
          title="In progress"
          value={inProgress}
          caption="Moving things forward"
        />
        <Stat
          title="Blocked"
          value={blocked}
          caption={blocked ? "Needs your attention" : "The path is clear"}
        />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Project momentum</h2>
              <CheckCircle2 size={17} className="text-primary" />
            </div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <span className="text-5xl font-semibold tracking-tighter">
                {progress}
                <span className="ml-1 text-2xl text-[#686e65]">%</span>
              </span>
              <p className="text-xs text-[#93998d]">
                {completed} of {tasks.length} tasks complete
              </p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-xs text-[#686e65]">
              {tasks.length
                ? "Every finished task moves the whole team forward."
                : "Add your first task to start building momentum."}
            </p>
          </section>
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-sm font-semibold">Recent tasks</h2>
              <Link
                href={`/projects/${projectId}/tasks`}
                className="inline-flex items-center gap-1 text-xs text-[#93998d] hover:text-primary"
              >
                View all
                <ArrowRight size={13} />
              </Link>
            </div>
            {tasks.length ? (
              tasks
                .slice(0, 5)
                .map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatus={updateStatus}
                    busy={busy === task.id}
                  />
                ))
            ) : (
              <div className="p-5">
                <EmptyState
                  title="A clean slate"
                  description="Break your project into small, achievable steps."
                  action={
                    <button
                      className="btn-secondary"
                      onClick={() => setCreating(true)}
                    >
                      <Plus size={15} />
                      Add your first task
                    </button>
                  }
                />
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-5">
          <div className="panel border-primary/20 p-6">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={19} />
            </div>
            <p className="eyebrow mb-2">A fresh perspective</p>
            <h2 className="text-xl font-medium tracking-tight">
              Your next move,
              <br />a little clearer.
            </h2>
            <p className="mb-6 mt-3 text-sm leading-6 text-[#93998d]">
              Turn your project context into an actionable plan, or spot risks
              before they slow your team down.
            </p>
            <Link
              href={`/projects/${projectId}/ai`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              Open AI assistant
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="panel p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Project details</h2>
              <Link
                href={`/projects/${projectId}/contributors`}
                className="text-xs text-primary hover:underline"
              >
                Contributors
              </Link>
            </div>
            <dl className="space-y-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#93998d]">Priority</dt>
                <dd>{label(project.priority)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#93998d]">Workspace</dt>
                <dd>{project.workspace?.name || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#93998d]">Team members</dt>
                <dd>{project.members?.length || 0}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
