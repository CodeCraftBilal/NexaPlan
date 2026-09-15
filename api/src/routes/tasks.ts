import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
import { sendResponse } from "../utils/apiResponse.js";
import { TaskService } from "../services/task.service.js";
import { io } from "../config/socket.js";

const router = Router();
router.use(authenticate);

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const task = await TaskService.createTask({
      ...req.body,
      creatorId: req.user!.id,
    });
    
    // Broadcast via socket
    io.to(`project_${task.projectId}`).emit("task:created", task);
    
    sendResponse(res, 201, true, "Task created", task);
  } catch (error) {
    next(error);
  }
});

router.get("/project/:projectId", async (req: AuthRequest, res, next) => {
  try {
    const tasks = await TaskService.getProjectTasks(req.params.projectId as string);
    sendResponse(res, 200, true, "Tasks retrieved", tasks);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", async (req: AuthRequest, res, next) => {
  try {
    const task = await TaskService.updateTaskStatus(req.params.id as string, req.body.status);
    
    io.to(`project_${task.projectId}`).emit("task:updated", task);
    
    sendResponse(res, 200, true, "Task status updated", task);
  } catch (error) {
    next(error);
  }
});

export default router;
