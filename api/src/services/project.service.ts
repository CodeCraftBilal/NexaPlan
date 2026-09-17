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
    const access = await requireProjectAccess(projectId, userId);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        workspace: { select: { name: true } },
      },
    });

    if (!project) throw new HttpError(404, "Project not found");

    return { ...project, permissions: { canManageContributors: access.canManageContributors, canAddWorkspaceMembers: access.canAddWorkspaceMembers } };
  }

  static async addContributor(projectId: string, actorId: string, input: { email: string; role: ProjectRole }) {
    const access = await requireProjectAccess(projectId, actorId);
    if (!access.canManageContributors) throw new HttpError(403, "Only project managers and workspace managers can add contributors");

    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirst({ where: { email: { equals: input.email, mode: "insensitive" } }, select: { id: true } });
        if (!user) throw new HttpError(404, "No account found with this email. Ask them to register first, then add them here.");
        const existing = await tx.projectMember.findUnique({ where: { projectId_userId: { projectId, userId: user.id } } });
        if (existing) throw new HttpError(409, "This person is already a contributor to this project");
        const workspaceMember = await tx.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId: access.workspaceId, userId: user.id } } });
        if (!workspaceMember && !access.canAddWorkspaceMembers) throw new HttpError(403, "Ask a workspace owner or manager to add this person to the workspace first");
        if (workspaceMember?.role === "VIEWER" && input.role !== "VIEWER") throw new HttpError(400, "Workspace viewers can only be added as project viewers");
        if (!workspaceMember) {
          // Workspace membership is required by project access checks. Do not
          // overwrite an existing workspace role or grant workspace management.
          await tx.workspaceMember.upsert({
            where: { workspaceId_userId: { workspaceId: access.workspaceId, userId: user.id } },
            create: { workspaceId: access.workspaceId, userId: user.id, role: "MEMBER" },
            update: {},
          });
        }
        return tx.projectMember.create({
          data: { projectId, userId: user.id, role: input.role },
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        });
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") throw new HttpError(409, "This person is already a contributor to this project");
      throw error;
    }
  }
}
