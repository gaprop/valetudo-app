import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errors";
import { validateLoginBody } from "../middleware/validation";

export const authRoutes = Router();

authRoutes.post("/login", validateLoginBody, asyncHandler(AuthController.login));
authRoutes.post("/logout", requireAuth, asyncHandler(AuthController.logout));
authRoutes.get("/me", requireAuth, asyncHandler(AuthController.me));
