import { Router } from "express";
import { TaskValidator } from "../middlewares/validator";
import {
  verifyTokenAndAuthorization,
  requireAdmin,
} from "../middlewares/verifyToken";
import {
  addNewTask,
  getTask,
  getTasks,
  claimTaskController,
} from "../controllers/taskController";

const router = Router();

router.post(
  "",
  verifyTokenAndAuthorization,
  TaskValidator,
  requireAdmin,
  addNewTask
);
router.get("", verifyTokenAndAuthorization, getTasks);
router.get("/:id", verifyTokenAndAuthorization, getTask);
router.patch("/:id/claim", verifyTokenAndAuthorization, claimTaskController);

export default router;
