import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { sendResponse } from "../utils/apiResponse.js";
import { AIService } from "../services/ai.service.js";
import { ProjectAssistantService } from "../services/project-assistant.service.js";
import { assistantRequestSchema } from "../utils/validation.js";

const router = Router();
router.use(authenticate);

router.post("/chat", async (req: AuthRequest, res, next) => {
  try {
    const result = await ProjectAssistantService.chat(
      req.user!.id,
      assistantRequestSchema.parse(req.body),
    );
    res.setHeader("Cache-Control", "no-store");
    sendResponse(res, 200, true, "Assistant response generated", result);
  } catch (error) {
    next(error);
  }
});

router.post("/project-plan", async (req: AuthRequest, res, next) => {
  try {
    const { description } = req.body;
    if (!description) {
      return sendResponse(res, 400, false, "Description is required");
    }

    const plan = await AIService.generateProjectPlan(description);
    sendResponse(res, 200, true, "Project plan generated", { plan });
  } catch (error) {
    next(error);
  }
});

router.post("/risk-analysis", async (req: AuthRequest, res, next) => {
  try {
    const { projectContext } = req.body;
    const analysis = await AIService.analyzeRisk(projectContext);
    sendResponse(res, 200, true, "Risk analysis completed", { analysis });
  } catch (error) {
    next(error);
  }
});

export default router;
