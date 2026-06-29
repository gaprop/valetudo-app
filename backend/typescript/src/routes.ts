import { Router } from "express";
import { exercisesRoutes } from "./routes/exercisesRoutes.js";
import { workoutPlanRoutes } from "./routes/workoutPlanRoutes.js";
import { workoutsRoutes } from "./routes/workoutsRoutes.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/exercises", exercisesRoutes);
routes.use("/api/workouts", workoutsRoutes);
routes.use("/api/workout-plan", workoutPlanRoutes);
