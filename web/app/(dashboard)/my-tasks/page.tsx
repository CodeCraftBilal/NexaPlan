"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCheck, Circle, Search } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, label } from "@/lib/project-data";
import type { ApiResponse, Task, TaskStatus } from "@/lib/types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Stat,
  TaskRow,
} from "@/components/project-ui";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("OPEN");
  const [priority, setPriority] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    api
      .get<ApiResponse<Task[]>>("/tasks/mine")
      .then((response) => {
        if (active) {
          setTasks(response.data.data);
          setError("");
        }
      })
      .catch((error) => {
        if (active)
          setError(errorMessage(error, "We couldn't load your tasks."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);
  async function updateStatus(task: Task, status: TaskStatus) {
    if (busy) return;
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
  const completed = tasks.filter((task) => task.status === "COMPLETED").length;
  const open = tasks.filter(
    (task) => !["COMPLETED", "CANCELLED"].includes(task.status),
  );
  const filtered = tasks.filter(
    (task) =>
      `${task.title} ${task.project?.name || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (priority === "ALL" || task.priority === priority) &&
      (filter === "ALL" ||
        (filter === "OPEN"
          ? !["COMPLETED", "CANCELLED"].includes(task.status)
          : task.status === "COMPLETED")),
  );
  return (
    <div className="page-enter mx-auto max-w-7xl space-y-8">
      <div className="page-header">
        <div>
          <p className="eyebrow mb-3">Find your focus</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My tasks<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 text-sm text-[#93998d]">
            Your next steps, all in one place.
          </p>
        </div>
        <Link href="/projects" className="btn-secondary">
          Explore projects
          <ArrowUpRight size={15} />
        </Link>
      </div>
      {loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              title="On your list"
              value={open.length}
              caption="Open tasks assigned to you"
            />
            <Stat
              title="In motion"
              value={
                tasks.filter((task) => task.status === "IN_PROGRESS").length
              }
              caption="Work you're moving forward"
            />
            <Stat
              title="Done and dusted"
              value={completed}
              caption="Small wins add up"
            />
          </div>
          {error && (
            <ErrorState
              message={error}
              onRetry={() => {
                setLoading(true);
                setVersion((n) => n + 1);
              }}
            />
          )}
          <div className="panel overflow-hidden">
            <div className="flex flex-col justify-between gap-4 border-b border-border p-4 lg:flex-row">
              <div className="flex gap-1">
                {[
                  { id: "OPEN", name: "To do", icon: Circle },
                  { id: "COMPLETED", name: "Completed", icon: CheckCheck },
                  { id: "ALL", name: "All tasks", icon: Circle },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${filter === tab.id ? "bg-surface-hover text-primary" : "text-[#93998d] hover:text-foreground"}`}
                  >
                    <tab.icon size={13} />
                    {tab.name}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#686e65]"
                  />
                  <input
                    aria-label="Search my tasks"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="field w-full py-2! pl-9! text-sm"
                    placeholder="Search tasks…"
                  />
                </div>
                <select
                  aria-label="Filter by priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="field py-2! text-sm"
                >
                  <option value="ALL">All priorities</option>
                  {["URGENT", "HIGH", "MEDIUM", "LOW"].map((value) => (
                    <option key={value} value={value}>
                      {label(value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {filtered.length ? (
              filtered.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onStatus={updateStatus}
                  busy={busy !== null}
                  showProject
                />
              ))
            ) : (
              <div className="p-5">
                <EmptyState
                  title={
                    tasks.length
                      ? "You're all clear here"
                      : "Room for your next great idea"
                  }
                  description={
                    tasks.length
                      ? "No tasks match this view. Try another filter or enjoy a moment of clarity."
                      : "Tasks assigned to you will appear here. Open a project to create and assign your first task."
                  }
                  action={
                    !tasks.length && (
                      <Link href="/projects" className="btn-primary">
                        View projects
                        <ArrowUpRight size={15} />
                      </Link>
                    )
                  }
                />
              </div>
            )}
            <div className="border-t border-border px-6 py-3 text-sm text-[#686e65]">
              {filtered.length} of {tasks.length} tasks
            </div>
          </div>
        </>
      )}
    </div>
  );
}
