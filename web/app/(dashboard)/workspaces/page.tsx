"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  Loader2,
  Plus,
  Users,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { fetchWorkspaces, errorMessage } from "@/lib/project-data";
import type { ApiResponse, Workspace } from "@/lib/types";
import { EmptyState, ErrorState, LoadingState } from "@/components/project-ui";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    fetchWorkspaces()
      .then((data) => {
        if (active) {
          setWorkspaces(data);
          setError("");
        }
      })
      .catch((error) => {
        if (active)
          setError(errorMessage(error, "We couldn't load your workspaces."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);
  async function createWorkspace(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setFormError("");
    try {
      const response = await api.post<ApiResponse<Workspace>>("/workspaces", {
        name: name.trim(),
        description: description.trim(),
      });
      setWorkspaces((items) => [
        ...items,
        { ...response.data.data, _count: { projects: 0, members: 1 } },
      ]);
      setCreating(false);
      setName("");
      setDescription("");
    } catch (error) {
      setFormError(errorMessage(error, "We couldn't create your workspace."));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-enter mx-auto max-w-7xl space-y-8">
      <div className="page-header">
        <div>
          <p className="eyebrow mb-3">A place for every team</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Workspaces<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 text-sm text-[#93998d]">
            Shared goals start with a shared space.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreating(true)}>
          <Plus size={17} />
          New workspace
        </button>
      </div>
      {creating && (
        <form
          onSubmit={createWorkspace}
          className="panel space-y-5 border-primary/30 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create a workspace</h2>
            <button
              type="button"
              aria-label="Close workspace form"
              className="text-[#93998d]"
              onClick={() => setCreating(false)}
            >
              <X size={18} />
            </button>
          </div>
          {formError && <ErrorState message={formError} />}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="workspace-name"
                className="mb-2 block text-sm text-[#b1b7a9]"
              >
                Workspace name
              </label>
              <input
                autoFocus
                id="workspace-name"
                className="field w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                placeholder="e.g. Product studio"
              />
            </div>
            <div>
              <label
                htmlFor="workspace-description"
                className="mb-2 block text-sm text-[#b1b7a9]"
              >
                Description (optional)
              </label>
              <input
                id="workspace-description"
                className="field w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What brings your team together?"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => setCreating(false)}
            >
              Cancel
            </button>
            <button disabled={busy || !name.trim()} className="btn-primary">
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? "Creating…" : "Create workspace"}
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setVersion((n) => n + 1);
          }}
        />
      ) : workspaces.length === 0 ? (
        <EmptyState
          title="Give your team a home"
          description="A workspace keeps your projects and people connected. Create your first one to get started."
          action={
            <button className="btn-primary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create a workspace
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.id}`}
              className="panel group flex flex-col p-6 transition hover:-translate-y-1 hover:border-[#606c50]"
            >
              <div className="mb-7 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-semibold text-primary">
                  {workspace.name.slice(0, 2).toUpperCase()}
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-[#686e65] group-hover:text-primary"
                />
              </div>
              <p className="eyebrow mb-2">Workspace</p>
              <h2 className="text-xl font-semibold tracking-tight group-hover:text-primary">
                {workspace.name}
              </h2>
              <p className="mb-8 mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#93998d]">
                {workspace.description ||
                  "Your team’s shared space for meaningful work."}
              </p>
              <div className="mt-auto flex items-center gap-5 border-t border-border pt-4 text-sm text-[#93998d]">
                <span className="flex items-center gap-2">
                  <FolderKanban size={14} />
                  {workspace._count?.projects || 0} projects
                </span>
                <span className="flex items-center gap-2">
                  <Users size={14} />
                  {workspace._count?.members || 0} members
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-[#686e65]">
        <Building2 size={14} />
        One space for your people, projects, and possibilities.
      </div>
    </div>
  );
}
