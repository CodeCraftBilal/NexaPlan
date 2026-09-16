import { prisma } from "../config/database.js";
import { ProjectRole } from "@prisma/client";
import { requireProjectAccess, requireWorkspaceAccess } from "./access.service.js";
import { HttpError } from "../utils/httpError.js";

export class ProjectService {
  static async createProject(data: { name: string; description: string | null; workspaceId: string; ownerId: string }) {
    await requireWorkspaceAccess(data.workspaceId, data.ownerId, true);
    return prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: ProjectRole.MANAGER,
          },
        },
      },
    });
  }

  static async getWorkspaceProjects(workspaceId: string, userId: string) {
    const member = await requireWorkspaceAccess(workspaceId, userId);
    const managesWorkspace = member.role === "OWNER" || member.role === "MANAGER";

    return prisma.project.findMany({
      where: { workspaceId, ...(managesWorkspace ? {} : { members: { some: { userId } } }) },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });
  }

  static async getProjectById(projectId: string, userId: string) {
    await requireProjectAccess(projectId, userId);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        workspace: { select: { name: true } },
      },
    });

    if (!project) throw new HttpError(404, "Project not found");

    return project;
  }
}
