import { Router } from "express";
import { WorkoutPlanController } from "../controllers/workoutPlanController";
import { asyncHandler } from "../middleware/errors";
import {
  validateUUIDPathID,
  validateWorkoutPlanDayBody,
  validateWorkoutPlanItemBody,
} from "../middleware/validation";

export const workoutPlanRoutes = Router();

workoutPlanRoutes.get(
  "/days",
  asyncHandler(WorkoutPlanController.listWorkoutPlanDays)
);
workoutPlanRoutes.post(
  "/days",
  validateWorkoutPlanDayBody,
  asyncHandler(WorkoutPlanController.createWorkoutPlanDay)
);
workoutPlanRoutes.delete(
  "/days/:id",
  validateUUIDPathID("id", "day id"),
  asyncHandler(WorkoutPlanController.deleteWorkoutPlanDay)
);
workoutPlanRoutes.post(
  "/days/:id/items",
  validateUUIDPathID("id", "day id"),
  validateWorkoutPlanItemBody,
  asyncHandler(WorkoutPlanController.createWorkoutPlanItem)
);
workoutPlanRoutes.delete(
  "/days/:id/items/:itemID",
  validateUUIDPathID("id", "day id"),
  validateUUIDPathID("itemID", "item id"),
  asyncHandler(WorkoutPlanController.deleteWorkoutPlanItem)
);
