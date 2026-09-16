import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { sendResponse } from "../utils/apiResponse.js";
import { WorkspaceService } from "../services/workspace.service.js";
import { workspaceSchema } from "../utils/validation.js";

const router = Router();
router.use(authenticate);

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = workspaceSchema.parse(req.body);
    const workspace = await WorkspaceService.createWorkspace(name, description ?? null, req.user!.id);
    sendResponse(res, 201, true, "Workspace created", workspace);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const workspaces = await WorkspaceService.getUserWorkspaces(req.user!.id);
    sendResponse(res, 200, true, "Workspaces retrieved", workspaces);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const workspace = await WorkspaceService.getWorkspaceById(req.params.id as string, req.user!.id);
    sendResponse(res, 200, true, "Workspace retrieved", workspace);
  } catch (error) {
    next(error);
  }
});

export default router;
