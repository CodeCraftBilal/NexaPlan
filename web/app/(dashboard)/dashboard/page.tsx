"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Circle,
  Clock3,
  FolderKanban,
  Plus,
  Sparkles,
  CalendarDays,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { fetchProjects, label, errorMessage } from "@/lib/project-data";
import type { ApiResponse, Project, Task } from "@/lib/types";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([fetchProjects(), api.get<ApiResponse<Task[]>>("/tasks/mine")])
      .then(([projects, response]) => {
        if (active) {
          setProjects(projects);
          setTasks(response.data.data);
          setError("");
        }
      })
      .catch((error) => {
        if (active)
          setError(
            errorMessage(
              error,
              "Your overview couldn’t load. Please try again.",
            ),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);

  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  const open = tasks.filter(
    (task) => !["COMPLETED", "CANCELLED"].includes(task.status),
  );
  const overdue = open.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date(),
  );
  const focusTasks = [...open]
    .sort(
      (a, b) =>
        (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
        (b.dueDate ? new Date(b.dueDate).getTime() : Infinity),
    )
    .slice(0, 4);
  const stats = [
    {
      title: "Active projects",
      value: projects.filter((p) => p.status === "ACTIVE").length,
      subtitle: `${projects.length} projects in your workspace`,
      icon: FolderKanban,
      color: "text-primary",
      href: "/projects",
    },
    {
      title: "Tasks completed",
      value: completed,
      subtitle: "Every small win counts",
      icon: CheckCheck,
      color: "text-[#acb9f1]",
      href: "/my-tasks?status=COMPLETED",
    },
    {
      title: "On your plate",
      value: open.length,
      subtitle: "Assigned tasks still in progress",
      icon: Clock3,
      color: "text-[#e9ba73]",
      href: "/my-tasks",
    },
    {
      title: "Needs attention",
      value: overdue.length,
      subtitle: overdue.length
        ? "Overdue tasks to get back on track"
        : "No overdue tasks. Looking good.",
      icon: AlertCircle,
      color: "text-[#f38a82]",
      href: "/my-tasks",
    },
  ];
  const distribution = [
    {
      name: "To do",
      count: tasks.filter((t) => t.status === "TODO").length,
      color: "#727a6b",
    },
    {
      name: "In progress",
      count: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      color: "#e9ba73",
    },
    {
      name: "In review",
      count: tasks.filter((t) => t.status === "IN_REVIEW").length,
      color: "#acb9f1",
    },
    { name: "Completed", count: completed, color: "#c8f36a" },
    {
      name: "Blocked / cancelled",
      count: tasks.filter((t) => ["BLOCKED", "CANCELLED"].includes(t.status))
        .length,
      color: "#f38a82",
    },
  ];

  return (
    <div className="page-enter space-y-7">
      <div className="page-header">
        <div>
          <div className="eyebrow mb-3 flex items-center gap-2">
            <span className="h-px w-5 bg-primary" />
            Your daily perspective
          </div>
          <h1>
            Welcome back, {user?.name.split(" ")[0]}
            <span className="text-primary">.</span>
          </h1>
          <p>A little focus today. A big step forward tomorrow.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-zinc-400">
          <CalendarDays className="size-3.5" />
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
      {error ? (
        <div
          role="alert"
          className="panel flex flex-wrap items-center justify-between gap-3 p-6"
        >
          <p className="text-sm text-danger">{error}</p>
          <button
            className="btn-secondary"
            onClick={() => {
              setLoading(true);
              setError("");
              setRetry((v) => v + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 min-[460px]:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Link
                key={stat.title}
                href={stat.href}
                className="panel group p-5 transition-colors hover:border-zinc-600"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{stat.title}</span>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[32px] font-medium tracking-tight">
                    {loading ? (
                      <span className="inline-block h-9 w-10 animate-pulse rounded bg-white/5" />
                    ) : (
                      stat.value.toString().padStart(2, "0")
                    )}
                  </span>
                  <ArrowUpRight className="size-4 text-zinc-600 transition-colors group-hover:text-primary" />
                </div>
                <p className="mt-3 text-[10px] text-zinc-500">
                  {stat.subtitle}
                </p>
              </Link>
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderKanban className="size-3.5" />
                  </span>
                  <h2 className="text-sm font-semibold">Your projects</h2>
                  <span className="text-xs text-zinc-600">
                    {projects.length.toString().padStart(2, "0")}
                  </span>
                </div>
                <Link className="muted-link" href="/projects">
                  View all <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-4 p-6" aria-label="Loading projects">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-lg bg-white/5"
                    />
                  ))}
                </div>
              ) : projects.length ? (
                <div className="divide-y divide-border">
                  {projects.slice(0, 4).map((project, index) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-white/2"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${index % 2 ? "bg-[#acb9f1]/10 text-[#acb9f1]" : "bg-primary/10 text-primary"}`}
                      >
                        {project.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium group-hover:text-primary">
                          {project.name}
                        </span>
                        <span className="mt-1.5 block truncate text-[11px] text-zinc-500">
                          {project.workspace?.name}{" "}
                          <span className="mx-1">·</span>{" "}
                          {project._count?.tasks || 0} tasks
                        </span>
                      </span>
                      <span className="status-badge hidden sm:inline-flex">
                        <span
                          className={`size-1 rounded-full ${project.status === "ACTIVE" ? "bg-primary" : "bg-zinc-500"}`}
                        />
                        {label(project.status)}
                      </span>
                      <ArrowUpRight className="size-4 text-zinc-600" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="icon-box mb-1 text-primary">
                    <FolderKanban className="size-5" />
                  </div>
                  <h3 className="text-sm font-medium">
                    Great work starts with a plan
                  </h3>
                  <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
                    Create a workspace, add your first project, and turn ideas
                    into progress.
                  </p>
                  <Link
                    href="/workspaces"
                    className="btn-secondary mt-2 text-xs!"
                  >
                    <Plus className="size-3.5" />
                    Create a workspace
                  </Link>
                </div>
              )}
            </section>
            <section className="panel flex flex-col p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Your task snapshot</h2>
                <span className="text-[10px] text-zinc-500">All time</span>
              </div>
              <div className="mt-7 flex items-end gap-2">
                <span className="text-4xl font-medium tracking-tight">
                  {loading ? "—" : tasks.length}
                </span>
                <span className="mb-1 text-xs text-zinc-500">
                  assigned tasks
                </span>
              </div>
              <div
                className="mt-6 flex h-2.5 gap-1 overflow-hidden rounded-full bg-white/5"
                aria-label="Task status distribution"
              >
                {distribution
                  .filter((d) => d.count > 0)
                  .map((d) => (
                    <div
                      key={d.name}
                      style={{
                        width: `${(d.count / tasks.length) * 100}%`,
                        backgroundColor: d.color,
                      }}
                      title={`${d.name}: ${d.count}`}
                    />
                  ))}
              </div>
              <div className="mt-6 space-y-3.5">
                {distribution.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2.5 text-[11px]"
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-zinc-400">{d.name}</span>
                    <span className="ml-auto font-medium text-zinc-300">
                      {loading ? "—" : d.count}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/my-tasks"
                className="muted-link mt-6 border-t border-border pt-4"
              >
                Make your next move <ArrowRight className="ml-auto size-3.5" />
              </Link>
            </section>
            <section className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-5">
                <h2 className="text-sm font-semibold">Your next priorities</h2>
                <Link href="/my-tasks" className="muted-link">
                  My tasks <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
              {loading ? (
                <div className="p-6 text-xs text-zinc-500">
                  Finding your next steps…
                </div>
              ) : focusTasks.length ? (
                <div className="divide-y divide-border">
                  {focusTasks.map((task) => (
                    <Link
                      href={`/projects/${task.projectId}`}
                      key={task.id}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-white/2"
                    >
                      <Circle className="size-4 shrink-0 text-zinc-600" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">
                          {task.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-zinc-500">
                          {task.project?.name || "Project task"}
                        </span>
                      </span>
                      <span
                        className={`text-[10px] ${task.priority === "URGENT" ? "text-danger" : "text-zinc-500"}`}
                      >
                        {label(task.priority)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4 px-6 py-10">
                  <span className="icon-box text-primary">
                    <Check className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">
                      A clear space for what’s next
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-500">
                      Tasks assigned to you will appear here.
                    </p>
                  </div>
                </div>
              )}
            </section>
            <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-[#202819] p-6">
              <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-primary">
                  <Sparkles className="size-3" />
                  Built for your next big idea
                </span>
                <h2 className="mt-5 text-[22px] font-medium leading-tight tracking-tight">
                  Less busywork.
                  <br />
                  More forward.
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-[#a4b197]">
                  Get a fresh perspective on your project with AI summaries,
                  plans, and risk analysis.
                </p>
                <Link
                  href={
                    projects.length
                      ? `/projects/${projects[0].id}/ai`
                      : "/projects/new"
                  }
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-primary"
                >
                  {projects.length
                    ? "Open project assistant"
                    : "Create your first project"}
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
      <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-zinc-600">
        <Layers className="size-3" />A little more organized. A little more
        possible.
      </div>
    </div>
  );
}
