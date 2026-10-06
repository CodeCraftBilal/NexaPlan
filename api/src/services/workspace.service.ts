import { prisma } from "../config/database.js";
import { WorkspaceRole } from "../generated/prisma/enums.js";
import { HttpError } from "../utils/httpError.js";

export class WorkspaceService {
  static async createWorkspace(
    name: string,
    description: string | null,
    ownerId: string,
  ) {
    return prisma.workspace.create({
      data: {
        name,
        description,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });
  }

  static async getUserWorkspaces(userId: string) {
    return prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
    });
  }

  static async getWorkspaceById(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        projects: {
          select: { id: true, name: true, status: true, priority: true },
        },
      },
    });

    if (!workspace) throw new HttpError(404, "Workspace not found");
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember)
      throw new HttpError(403, "You do not have access to this workspace");

    return workspace;
  }
}
