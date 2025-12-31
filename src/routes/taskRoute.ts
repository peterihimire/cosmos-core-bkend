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
  deleteTaskController,
  updateTaskController,
} from "../controllers/taskController";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const router = Router();

const claimLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 claims per minute
  keyGenerator: (req) => req?.user?.id || ipKeyGenerator(req as any),
  message: {
    status: "error",
    msg: "You are claiming tasks too fast. Slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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
  "/:id",
  verifyTokenAndAuthorization,
  requireAdmin,
  updateTaskController
);
router.delete(
  "/:id",
  verifyTokenAndAuthorization,
  requireAdmin,
  deleteTaskController
);
router.patch(
  "/:id/claim",
  verifyTokenAndAuthorization,
  claimLimiter,
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
