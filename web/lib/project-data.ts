import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import type { ApiResponse, Project, Workspace } from "@/lib/types";

export async function fetchWorkspaces() {
  const response = await api.get<ApiResponse<Workspace[]>>("/workspaces");
  return response.data.data;
}

export async function fetchProjects() {
  const workspaces = await fetchWorkspaces();
  const groups = await Promise.all(workspaces.map(async (workspace) => {
    const response = await api.get<ApiResponse<Project[]>>(`/projects/workspace/${workspace.id}`);
    return response.data.data.map((project) => ({ ...project, workspace: { name: workspace.name } }));
  }));
  return groups.flat();
}

export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (isAxiosError(error)) return error.response?.data?.message || fallback;
  return error instanceof Error ? error.message : fallback;
}

export function label(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase());
}
