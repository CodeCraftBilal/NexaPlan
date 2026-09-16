import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { sendResponse } from "../utils/apiResponse.js";
import { ProjectService } from "../services/project.service.js";
import { projectSchema } from "../utils/validation.js";

const router = Router();
router.use(authenticate);

// We need a way to create projects within a workspace.
// Typically POST /workspaces/:workspaceId/projects, but let's accept workspaceId in body for simplicity
router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { name, description, workspaceId } = projectSchema.parse(req.body);
    const project = await ProjectService.createProject({
      name,
      description: description ?? null,
      workspaceId,
      ownerId: req.user!.id,
    });
    sendResponse(res, 201, true, "Project created", project);
  } catch (error) {
    next(error);
  }
});

router.get("/workspace/:workspaceId", async (req: AuthRequest, res, next) => {
  try {
    const projects = await ProjectService.getWorkspaceProjects(req.params.workspaceId as string, req.user!.id);
    sendResponse(res, 200, true, "Projects retrieved", projects);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id as string, req.user!.id);
    sendResponse(res, 200, true, "Project retrieved", project);
  } catch (error) {
    next(error);
  }
});

export default router;
