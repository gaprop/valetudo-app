import { Router } from "express";
import {
  createWorkoutPlanDay,
  createWorkoutPlanItem,
  deleteWorkoutPlanDay,
  deleteWorkoutPlanItem,
  listWorkoutPlanDays,
} from "../controllers/workoutPlanController";
import { asyncHandler } from "../middleware/errors";

export const workoutPlanRoutes = Router();

workoutPlanRoutes.get("/days", asyncHandler(listWorkoutPlanDays));
workoutPlanRoutes.post("/days", asyncHandler(createWorkoutPlanDay));
workoutPlanRoutes.delete("/days/:id", asyncHandler(deleteWorkoutPlanDay));
workoutPlanRoutes.post("/days/:id/items", asyncHandler(createWorkoutPlanItem));
workoutPlanRoutes.delete(
  "/days/:id/items/:itemID",
  asyncHandler(deleteWorkoutPlanItem)
);
