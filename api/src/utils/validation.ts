import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password must be at most 72 bytes",
    ),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .max(100),
  description: z.string().trim().max(2000).nullable().optional(),
});

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(150),
  description: z.string().trim().max(5000).nullable().optional(),
  workspaceId: z.string().min(1, "Choose a workspace"),
});

export const contributorSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  role: z.enum(["MEMBER", "VIEWER", "MANAGER"]).default("MEMBER"),
});

const taskStatus = z.enum([
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "BLOCKED",
  "CANCELLED",
]);
export const taskStatusSchema = z.object({ status: taskStatus });
export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(250),
  description: z.string().trim().max(10000).optional(),
  projectId: z.string().min(1, "Choose a project"),
  assigneeId: z.string().min(1).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: taskStatus.optional(),
});
