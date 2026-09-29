import { prisma } from "../config/database.js";
import { HttpError } from "../utils/httpError.js";

export async function requireWorkspaceAccess(
  workspaceId: string,
  userId: string,
  write = false,
) {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member || (write && member.role === "VIEWER")) {
    throw new HttpError(403, "You do not have access to this workspace");
  }
  return member;
}

export async function requireProjectAccess(
  projectId: string,
  userId: string,
  write = false,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      workspaceId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });
  if (!project) throw new HttpError(404, "Project not found");
  const workspaceMember = await requireWorkspaceAccess(
    project.workspaceId,
    userId,
  );
  const managesWorkspace =
    workspaceMember.role === "OWNER" || workspaceMember.role === "MANAGER";
  const projectMember = project.members[0];
  if (
    !managesWorkspace &&
    (!projectMember ||
      (write &&
        (projectMember.role === "VIEWER" || workspaceMember.role === "VIEWER")))
  ) {
    throw new HttpError(
      403,
      write
        ? "You do not have permission to edit this project"
        : "You do not have access to this project",
    );
  }
  return {
    ...project,
    canEditProject:
      managesWorkspace ||
      (Boolean(projectMember) &&
        projectMember?.role !== "VIEWER" &&
        workspaceMember.role !== "VIEWER"),
    canManageContributors:
      managesWorkspace ||
      (projectMember?.role === "MANAGER" && workspaceMember.role !== "VIEWER"),
    canAddWorkspaceMembers: managesWorkspace,
  };
}
