export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email?: string; avatar?: string | null };
}

export interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  members?: Member[];
  projects?: Project[];
  _count?: { members: number; projects: number };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  priority: string;
  workspaceId: string;
  permissions?: {
    canManageContributors: boolean;
    canAddWorkspaceMembers: boolean;
  };
  workspace?: { name: string };
  members?: Member[];
  dueDate?: string | null;
  _count?: { tasks: number; members: number };
}

export type TaskStatus =
  "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "BLOCKED" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface SuggestedTask {
  title: string;
  description: string;
  priority: Priority;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantResponse {
  reply: string;
  suggestedTasks: SuggestedTask[];
  canCreateTasks: boolean;
  context: { taskCount: number; includedTasks: number; asOf: string };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  project?: { id: string; name: string };
  assigneeId?: string | null;
  assignee?: { id: string; name: string; avatar?: string | null } | null;
  dueDate?: string | null;
  createdAt?: string;
}
