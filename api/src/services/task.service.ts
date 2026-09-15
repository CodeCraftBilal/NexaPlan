import { prisma } from "../config/database.js";
import { TaskStatus, TaskPriority } from "@prisma/client";

export class TaskService {
  static async createTask(data: { title: string; description?: string; projectId: string; creatorId: string; assigneeId?: string; priority?: TaskPriority; status?: TaskStatus }) {
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

  static async getProjectTasks(projectId: string) {
    return prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateTaskStatus(taskId: string, status: TaskStatus) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }
}
