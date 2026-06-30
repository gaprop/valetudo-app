import { Router } from "express";
import { exercisesRoutes } from "./routes/exercisesRoutes";
import { ingredientsRoutes } from "./routes/ingredientsRoutes";
import { planDaysRoutes } from "./routes/planDaysRoutes";
import { recipesRoutes } from "./routes/recipesRoutes";
import { trainingSessionsRoutes } from "./routes/trainingSessionsRoutes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/exercises", exercisesRoutes);
routes.use("/api/ingredients", ingredientsRoutes);
routes.use("/api/recipes", recipesRoutes);
routes.use("/api/workouts", trainingSessionsRoutes);
routes.use("/api/workout-plan", planDaysRoutes);
