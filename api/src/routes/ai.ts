import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { sendResponse } from "../utils/apiResponse.js";
import { AIService } from "../services/ai.service.js";

const router = Router();
router.use(authenticate);

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
