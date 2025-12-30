import { Router } from "express";
import { addNewTask } from "../controllers/taskController";
import { addNewProject } from "../controllers/projectController";
import { ProjectValidator } from "../middlewares/validator";
import {
  verifyTokenAndAuthorization,
  requireAdmin,
} from "../middlewares/verifyToken";

const router = Router();

router.post(
  "",
  verifyTokenAndAuthorization,
  ProjectValidator,
  requireAdmin,
  addNewProject
);
// router.get("", verifyTokenAndAuthorization, getTransactions);
// router.get("/:id", verifyTokenAndAuthorization, getTransaction);

export default router;
