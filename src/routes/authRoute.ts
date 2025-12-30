import { Router } from "express";
import {
  login,
  logout,
  register,
  refresh,
} from "../controllers/authController";
import { SignupValidator, } from "../middlewares/validator";
import { requireAdmin } from "../middlewares/verifyToken";

const router = Router();

router.post("/signup", SignupValidator, register);
router.post("/signin", login);
router.post("/signout", logout);
router.post("/refresh-token", refresh);

export default router;
