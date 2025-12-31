import { Router } from "express";
import { addNewProject } from "../controllers/projectController";
import { ProjectValidator } from "../middlewares/validatorMiddleware";
import {
  verifyTokenAndAuthorization,
  requireAdmin,
} from "../middlewares/authMiddleware";

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
