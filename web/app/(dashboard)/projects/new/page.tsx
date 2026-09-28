"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FolderKanban,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, fetchWorkspaces } from "@/lib/project-data";
import type { ApiResponse, Project, Workspace } from "@/lib/types";
import { ErrorState, LoadingState } from "@/components/project-ui";

export default function NewProjectPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    fetchWorkspaces()
      .then((data) => {
        if (!active) return;
        const requested = new URLSearchParams(window.location.search).get(
          "workspace",
        );
        setWorkspaces(data);
        setWorkspaceId(
          data.find((workspace) => workspace.id === requested)?.id ||
            data[0]?.id ||
            "",
        );
        setLoadError("");
      })
      .catch((error) => {
        if (active)
          setLoadError(
            errorMessage(error, "We couldn't load your workspaces."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !workspaceId || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await api.post<ApiResponse<Project>>("/projects", {
        name: name.trim(),
        description: description.trim(),
        workspaceId,
      });
      router.push(
        `/projects/${response.data.data.id}${useAI ? "/ai?plan=1" : ""}`,
      );
    } catch (error) {
      setError(errorMessage(error, "We couldn't create your project."));
      setBusy(false);
    }
  }
  return (
    <div className="page-enter mx-auto max-w-5xl space-y-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs text-[#93998d] hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to projects
      </Link>
      <div>
        <p className="eyebrow mb-3">From idea to impact</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start something great<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 text-sm text-[#93998d]">
          A little context now. A clear path forward.
        </p>
      </div>
      {loading ? (
        <LoadingState />
      ) : loadError ? (
        <ErrorState
          message={loadError}
          onRetry={() => {
            setLoading(true);
            setVersion((n) => n + 1);
          }}
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
          <form onSubmit={submit} className="panel space-y-6 p-6 sm:p-8">
            {error && <ErrorState message={error} />}
            <div>
              <label
                htmlFor="project-name"
                className="mb-2 block text-xs font-medium text-[#b1b7a9]"
              >
                Project name
              </label>
              <input
                id="project-name"
                className="field w-full"
                placeholder="e.g. The next big launch"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                required
              />
            </div>
            <div>
              <label
                htmlFor="project-workspace"
                className="mb-2 block text-xs font-medium text-[#b1b7a9]"
              >
                Workspace
              </label>
              {workspaces.length ? (
                <select
                  id="project-workspace"
                  className="field w-full"
                  value={workspaceId}
                  onChange={(e) => setWorkspaceId(e.target.value)}
                  required
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4">
                  <p className="text-sm text-[#93998d]">
                    First, give your project a home.
                  </p>
                  <Link
                    href="/workspaces"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-primary"
                  >
                    <Plus size={15} />
                    Create a workspace
                  </Link>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="project-description"
                className="mb-2 block text-xs font-medium text-[#b1b7a9]"
              >
                Description{" "}
                <span className="text-[#686e65]">
                  {useAI ? "(required for a plan)" : "(optional)"}
                </span>
              </label>
              <textarea
                id="project-description"
                className="field w-full resize-y"
                rows={5}
                placeholder="What are you building? What would success look like?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required={useAI}
              />
            </div>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${useAI ? "border-primary/35 bg-primary/5" : "border-border hover:bg-surface-hover"}`}
            >
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#c8f36a]"
              />
              <span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles size={15} className="text-primary" />
                  Get a head start with AI
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#93998d]">
                  Open the assistant after creating your project to generate a
                  plan from your description.
                </span>
              </span>
            </label>
            <div className="flex justify-end gap-3 border-t border-border pt-6">
              <Link href="/projects" className="btn-secondary">
                Cancel
              </Link>
              <button
                disabled={
                  busy ||
                  !workspaceId ||
                  !name.trim() ||
                  (useAI && !description.trim())
                }
                className="btn-primary"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                {busy ? "Creating…" : "Create project"}
              </button>
            </div>
          </form>
          <aside className="space-y-5 p-3 lg:pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-primary">
              <FolderKanban size={22} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium">
              Big ideas.
              <br />
              Clear next steps.
            </h2>
            <p className="text-sm leading-6 text-[#93998d]">
              Keep everything your team needs in one thoughtful space.
            </p>
            {[
              "A home for every task",
              "A board that moves with you",
              "AI to help you see ahead",
            ].map((text) => (
              <p
                key={text}
                className="flex items-center gap-2 text-xs text-[#b1b7a9]"
              >
                <Check size={13} className="text-primary" />
                {text}
              </p>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
