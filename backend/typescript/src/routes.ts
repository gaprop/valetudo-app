import { Router } from "express";
import { requireAuth } from "./middleware/auth";
import { authRoutes } from "./routes/authRoutes";
import { exercisesRoutes } from "./routes/exercisesRoutes";
import { ingredientsRoutes } from "./routes/ingredientsRoutes";
import { planDaysRoutes } from "./routes/planDaysRoutes";
import { recipesRoutes } from "./routes/recipesRoutes";
import { trainingSessionsRoutes } from "./routes/trainingSessionsRoutes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/auth", authRoutes);
routes.use("/api/exercises", requireAuth, exercisesRoutes);
routes.use("/api/ingredients", requireAuth, ingredientsRoutes);
routes.use("/api/recipes", requireAuth, recipesRoutes);
routes.use("/api/workouts", requireAuth, trainingSessionsRoutes);
routes.use("/api/workout-plan", requireAuth, planDaysRoutes);
