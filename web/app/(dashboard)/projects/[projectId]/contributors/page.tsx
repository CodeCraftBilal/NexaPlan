"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Check, Loader2, UserPlus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, label } from "@/lib/project-data";
import type { ApiResponse, Member, Project } from "@/lib/types";
import {
  ErrorState,
  LoadingState,
  ProjectHeader,
} from "@/components/project-ui";

export default function ContributorsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [version, setVersion] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const emailInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    api
      .get<ApiResponse<Project>>(`/projects/${projectId}`)
      .then((response) => {
        if (active) {
          setProject(response.data.data);
          setLoadError("");
        }
      })
      .catch((error) => {
        if (active)
          setLoadError(
            errorMessage(error, "We couldn’t load the contributors."),
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, version]);

  async function addContributor(event: FormEvent) {
    event.preventDefault();
    if (busy || !email.trim()) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const response = await api.post<ApiResponse<Member>>(
        `/projects/${projectId}/contributors`,
        { email: email.trim(), role },
      );
      const member = response.data.data;
      setProject((current) =>
        current
          ? { ...current, members: [...(current.members || []), member] }
          : current,
      );
      setEmail("");
      setRole("MEMBER");
      setSuccess(`${member.user.name} was added to the project.`);
    } catch (error) {
      setError(
        errorMessage(
          error,
          "We couldn’t add this contributor. Please try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!project)
    return (
      <ErrorState
        message={loadError || "Project unavailable."}
        onRetry={() => {
          setLoading(true);
          setVersion((value) => value + 1);
        }}
      />
    );
  const canManage = project.permissions?.canManageContributors;

  return (
    <div className="page-enter mx-auto max-w-7xl space-y-7">
      <ProjectHeader
        project={project}
        action={
          canManage && (
            <button
              className="btn-primary"
              onClick={() => {
                emailInput.current?.scrollIntoView({ block: "center" });
                emailInput.current?.focus();
              }}
            >
              <UserPlus size={16} />
              Add contributor
            </button>
          )
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-primary" />
              <h2 className="text-sm font-semibold">Project contributors</h2>
            </div>
            <span className="status-badge">
              {project.members?.length || 0} people
            </span>
          </div>
          {project.members?.length ? (
            <ul className="divide-y divide-border">
              {project.members.map((member) => (
                <li key={member.id} className="flex items-center gap-3 p-5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {member.user.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {member.user.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {member.user.email}
                    </p>
                  </div>
                  <span className="status-badge">
                    {member.role === "MEMBER"
                      ? "Contributor"
                      : label(member.role)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-sm text-zinc-400">
              No contributors have been added yet.
            </p>
          )}
        </section>
        {canManage ? (
          <form onSubmit={addContributor} className="panel space-y-5 p-6">
            <div className="icon-box text-primary">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Better work, together</h2>
              <p className="mt-2 text-xs leading-6 text-zinc-400">
                Add someone using the email address of their registered
                ProjectAI account.
              </p>
            </div>
            {error && <ErrorState message={error} />}
            {success && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-xs leading-5 text-primary"
              >
                <Check size={15} className="mt-0.5 shrink-0" />
                {success}
              </p>
            )}
            <div>
              <label
                htmlFor="contributor-email"
                className="mb-2 block text-xs font-medium"
              >
                Email address
              </label>
              <input
                ref={emailInput}
                id="contributor-email"
                type="email"
                required
                maxLength={254}
                autoComplete="off"
                className="field"
                placeholder="teammate@example.com"
                value={email}
                disabled={busy}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSuccess("");
                }}
              />
            </div>
            <div>
              <label
                htmlFor="contributor-role"
                className="mb-2 block text-xs font-medium"
              >
                Project role
              </label>
              <select
                id="contributor-role"
                className="field"
                value={role}
                disabled={busy}
                aria-describedby="role-description"
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="MEMBER">Contributor</option>
                <option value="VIEWER">Viewer</option>
                <option value="MANAGER">Manager</option>
              </select>
              <p
                id="role-description"
                className="mt-2 text-xs leading-5 text-zinc-500"
              >
                {role === "VIEWER"
                  ? "Can view the project and tasks without making changes."
                  : role === "MANAGER"
                    ? "Can manage project work and add contributors."
                    : "Can create tasks and update project work."}
              </p>
            </div>
            <p className="rounded-lg border border-border p-3 text-xs leading-5 text-zinc-400">
              {project.permissions?.canAddWorkspaceMembers
                ? "If needed, they’ll also join this workspace as a member. They won’t receive access to other projects."
                : "You can add existing workspace members. A workspace owner or manager must add anyone new to the workspace."}
            </p>
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="btn-primary w-full"
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {busy ? "Adding contributor…" : "Add contributor"}
            </button>
          </form>
        ) : (
          <aside className="panel p-6">
            <h2 className="text-sm font-semibold">Growing your team?</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Ask a project manager or workspace owner to add contributors to
              this project.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}
