import { prisma } from "../config/database.js";
import { ProjectRole } from "@prisma/client";

export class ProjectService {
  static async createProject(data: { name: string; description: string | null; workspaceId: string; ownerId: string }) {
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
    const isWorkspaceMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!isWorkspaceMember) throw new Error("Unauthorized");

    return prisma.project.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { tasks: true, members: true } },
      },
    });
  }

  static async getProjectById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        workspace: { select: { name: true } },
      },
    });

    if (!project) throw new Error("Project not found");

    const isMember = project.members.some((m) => m.userId === userId);
    // Alternatively, if they are workspace owner, they should have access. For MVP, assuming they must be a project member.
    if (!isMember) throw new Error("Unauthorized");

    return project;
  }
}
