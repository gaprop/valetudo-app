import { Router } from "express";
import { exercisesRoutes } from "./routes/exercisesRoutes";
import { workoutPlanRoutes } from "./routes/workoutPlanRoutes";
import { workoutsRoutes } from "./routes/workoutsRoutes";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

routes.use("/api/exercises", exercisesRoutes);
routes.use("/api/workouts", workoutsRoutes);
routes.use("/api/workout-plan", workoutPlanRoutes);
