import { prisma } from "../config/database.js";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { requireProjectAccess } from "./access.service.js";
import { HttpError } from "../utils/httpError.js";

export class TaskService {
  static async createTask(data: {
    title: string;
    description?: string | undefined;
    projectId: string;
    creatorId: string;
    assigneeId?: string | undefined;
    priority?: TaskPriority | undefined;
    status?: TaskStatus | undefined;
  }) {
    await requireProjectAccess(data.projectId, data.creatorId, true);
    if (data.assigneeId)
      await requireProjectAccess(data.projectId, data.assigneeId);
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        projectId: data.projectId,
        creatorId: data.creatorId,
        assigneeId: data.assigneeId || null,
        priority: data.priority || TaskPriority.MEDIUM,
        status: data.status || TaskStatus.TODO,
      },
    });
  }

  static async getProjectTasks(projectId: string, userId: string) {
    await requireProjectAccess(projectId, userId);
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getMyTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId, assigneeId: null }],
        project: {
          workspace: { members: { some: { userId } } },
          OR: [
            { members: { some: { userId } } },
            {
              workspace: {
                members: {
                  some: { userId, role: { in: ["OWNER", "MANAGER"] } },
                },
              },
            },
          ],
        },
      },
      include: {
        project: { select: { id: true, name: true, workspaceId: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
  }

  static async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    userId: string,
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
    if (!task) throw new HttpError(404, "Task not found");
    await requireProjectAccess(task.projectId, userId, true);
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}
