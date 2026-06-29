import { Router } from "express";
import { WorkoutPlanController } from "../controllers/workoutPlanController";
import { asyncHandler } from "../middleware/errors";

export const workoutPlanRoutes = Router();

workoutPlanRoutes.get(
  "/days",
  asyncHandler(WorkoutPlanController.listWorkoutPlanDays)
);
workoutPlanRoutes.post(
  "/days",
  asyncHandler(WorkoutPlanController.createWorkoutPlanDay)
);
workoutPlanRoutes.delete(
  "/days/:id",
  asyncHandler(WorkoutPlanController.deleteWorkoutPlanDay)
);
workoutPlanRoutes.post(
  "/days/:id/items",
  asyncHandler(WorkoutPlanController.createWorkoutPlanItem)
);
workoutPlanRoutes.delete(
  "/days/:id/items/:itemID",
  asyncHandler(WorkoutPlanController.deleteWorkoutPlanItem)
);
