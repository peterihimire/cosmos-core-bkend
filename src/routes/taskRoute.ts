import { Router } from "express";
import { TaskValidator } from "../middlewares/validatorMiddleware";
import {
  verifyTokenAndAuthorization,
  requireAdmin,
} from "../middlewares/authMiddleware";
import { auditMiddleware } from "../middlewares/auditLogMiddleware";
import {
  addNewTask,
  getTask,
  getTasks,
  claimTaskController,
  completeTaskController,
} from "../controllers/taskController";

const router = Router();

router.post(
  "",
  verifyTokenAndAuthorization,
  TaskValidator,
  requireAdmin,
  auditMiddleware("TASK_CREATED", "Task"),
  addNewTask
);
router.get("", verifyTokenAndAuthorization, getTasks);
router.get("/:id", verifyTokenAndAuthorization, getTask);
router.patch(
  "/:id/claim",
  verifyTokenAndAuthorization,
  auditMiddleware("TASK_CLAIMED", "Task"),
  claimTaskController
);
router.patch(
  "/:id/complete",
  verifyTokenAndAuthorization,
  auditMiddleware("TASK_COMPLETED", "Task"),
  completeTaskController
);

export default router;
