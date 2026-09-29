import type { z } from "zod";
import { prisma } from "../config/database.js";
import { assistantRequestSchema } from "../utils/validation.js";
import { HttpError } from "../utils/httpError.js";
import { requireProjectAccess } from "./access.service.js";
import { AIService } from "./ai.service.js";

export class ProjectAssistantService {
  static async chat(
    userId: string,
    input: z.infer<typeof assistantRequestSchema>,
  ) {
    const access = await requireProjectAccess(input.projectId, userId);
    const project = await prisma.project.findUnique({
      where: { id: input.projectId },
      select: {
        name: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        _count: { select: { tasks: true } },
        tasks: {
          take: 101,
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
          select: {
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            assignee: { select: { name: true } },
          },
        },
      },
    });
    if (!project) throw new HttpError(404, "Project not found");
    const { tasks, ...details } = project;
    const context = {
      ...details,
      asOf: new Date().toISOString(),
      description: project.description?.slice(0, 5000),
      tasksTruncated: tasks.length > 100,
      tasks: tasks.slice(0, 100).map((task) => ({
        ...task,
        description: task.description?.slice(0, 1000),
      })),
    };
    const result = await AIService.chat(context, input.message, input.history);
    return {
      ...result,
      canCreateTasks: access.canEditProject,
      context: {
        taskCount: project._count.tasks,
        includedTasks: context.tasks.length,
        asOf: context.asOf,
      },
    };
  }
}
