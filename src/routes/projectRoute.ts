import { Router } from "express";
import {
  addNewProject,
  getAllProjectsController,
  getProject,
  updateProjectController,
  deleteProjectController,
} from "../controllers/projectController";
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
router.get("", verifyTokenAndAuthorization, getAllProjectsController);
router.get("/:id", verifyTokenAndAuthorization, getProject);
router.patch(
  "/:id",
  verifyTokenAndAuthorization,
  requireAdmin,
  updateProjectController
);
router.delete(
  "/:id",
  verifyTokenAndAuthorization,
  requireAdmin,
  deleteProjectController
);

export default router;
