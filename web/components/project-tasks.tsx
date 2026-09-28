"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, label } from "@/lib/project-data";
import type { Task, TaskStatus } from "@/lib/types";
import {
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
  ProjectHeader,
  TaskComposer,
  TaskRow,
  statuses,
  statusColors,
  useProject,
} from "@/components/project-ui";

export default function ProjectTasks({ view }: { view: "board" | "list" }) {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, tasks, setTasks, error, setError, loading, retry } =
    useProject(projectId);
  const [creating, setCreating] = useState<TaskStatus | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  async function updateStatus(task: Task, status: TaskStatus) {
    if (busy || task.status === status) return;
    setBusy(task.id);
    const previous = task.status;
    setTasks((items) =>
      items.map((item) => (item.id === task.id ? { ...item, status } : item)),
    );
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      setError("");
    } catch (error) {
      setTasks((items) =>
        items.map((item) =>
          item.id === task.id ? { ...item, status: previous } : item,
        ),
      );
      setError(
        errorMessage(
          error,
          "We couldn't move this task. Its original status has been restored.",
        ),
      );
    } finally {
      setBusy(null);
    }
  }
  function onDragEnd(result: DropResult) {
    if (
      !result.destination ||
      result.destination.droppableId === result.source.droppableId
    )
      return;
    const task = tasks.find((item) => item.id === result.draggableId);
    if (task)
      void updateStatus(task, result.destination.droppableId as TaskStatus);
  }
  if (loading) return <LoadingState />;
  if (!project)
    return (
      <ErrorState message={error || "Project unavailable."} onRetry={retry} />
    );
  const filtered = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "ALL" || task.priority === filter),
  );
  return (
    <div className="page-enter mx-auto max-w-[1600px] space-y-6">
      <ProjectHeader
        project={project}
        action={
          <button
            className="btn-primary shrink-0"
            onClick={() => setCreating("TODO")}
          >
            <Plus size={16} />
            Add task
          </button>
        }
      />
      {error && <ErrorState message={error} />}
      {creating && (
        <TaskComposer
          key={creating}
          project={project}
          initialStatus={creating}
          onCreated={(task) => setTasks((items) => [task, ...items])}
          onClose={() => setCreating(null)}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#686e65]"
            />
            <input
              aria-label="Search tasks"
              className="field w-full !py-2 !pl-9 text-xs sm:w-64"
              placeholder="Find a task…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter by priority"
            className="field !py-2 text-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All priorities</option>
            {["URGENT", "HIGH", "MEDIUM", "LOW"].map((priority) => (
              <option key={priority} value={priority}>
                {label(priority)}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-[#686e65]">
          {filtered.length} {filtered.length === 1 ? "task" : "tasks"}
          {view === "board" && (
            <span className="hidden sm:inline"> · Drag to update status</span>
          )}
        </p>
      </div>
      {view === "list" ? (
        filtered.length ? (
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-3 text-[10px] font-medium uppercase tracking-wider text-[#686e65]">
              <span>Task</span>
              <span>Priority & status</span>
            </div>
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onStatus={updateStatus}
                busy={busy !== null}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              tasks.length
                ? "Nothing matches just yet"
                : "A little structure goes a long way"
            }
            description={
              tasks.length
                ? "Adjust your search or priority filter to see more tasks."
                : "Add the first task and start moving your project forward."
            }
            action={
              !tasks.length && (
                <button
                  className="btn-primary"
                  onClick={() => setCreating("TODO")}
                >
                  <Plus size={16} />
                  Add a task
                </button>
              )
            }
          />
        )
      ) : (
        <div className="overflow-x-auto pb-5">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex min-w-max items-start gap-4">
              {statuses.map((status) => {
                const column = filtered.filter(
                  (task) => task.status === status,
                );
                return (
                  <section
                    key={status}
                    className="w-[270px] rounded-2xl border border-border bg-[#151815] p-3"
                  >
                    <div className="mb-4 flex items-center gap-2 px-1 pt-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: statusColors[status] }}
                      />
                      <h2 className="text-xs font-semibold">{label(status)}</h2>
                      <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] text-[#93998d]">
                        {column.length}
                      </span>
                      <button
                        aria-label={`Add task to ${label(status)}`}
                        onClick={() => setCreating(status)}
                        className="ml-auto rounded-md p-1 text-[#686e65] transition hover:bg-surface-hover hover:text-primary"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[200px] rounded-xl transition ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                        >
                          {column.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                              isDragDisabled={busy !== null}
                            >
                              {(drag, snapshot) => (
                                <article
                                  ref={drag.innerRef}
                                  {...drag.draggableProps}
                                  className={`mb-3 rounded-xl border bg-surface p-4 ${snapshot.isDragging ? "border-primary shadow-xl shadow-black/30" : "border-border"}`}
                                >
                                  <div className="mb-3 flex items-center justify-between">
                                    <Badge value={task.priority} />
                                    <span
                                      {...drag.dragHandleProps}
                                      aria-label={`Move ${task.title}`}
                                      className="p-1 text-[#686e65] hover:text-primary"
                                    >
                                      <GripVertical size={14} />
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-medium leading-6">
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#93998d]">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-3">
                                    <select
                                      aria-label={`Status of ${task.title}`}
                                      value={task.status}
                                      disabled={busy !== null}
                                      onChange={(e) =>
                                        updateStatus(
                                          task,
                                          e.target.value as TaskStatus,
                                        )
                                      }
                                      className="max-w-36 rounded border border-border bg-background px-1.5 py-1 text-[10px] text-[#93998d]"
                                    >
                                      {statuses.map((value) => (
                                        <option key={value} value={value}>
                                          {label(value)}
                                        </option>
                                      ))}
                                    </select>
                                    <span
                                      title={
                                        task.assignee?.name || "Unassigned"
                                      }
                                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-[9px] text-[#93998d]"
                                    >
                                      {task.assignee?.name
                                        .slice(0, 2)
                                        .toUpperCase() || "—"}
                                    </span>
                                  </div>
                                </article>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {column.length === 0 && (
                            <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border/70 text-xs text-[#686e65]">
                              {query || filter !== "ALL"
                                ? "No matching tasks"
                                : "A little room to move"}
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                    <button
                      onClick={() => setCreating(status)}
                      className="mt-2 flex w-full items-center gap-2 rounded-lg p-2 text-xs text-[#686e65] transition hover:bg-surface-hover hover:text-foreground"
                    >
                      <Plus size={14} />
                      Add task
                    </button>
                  </section>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}
