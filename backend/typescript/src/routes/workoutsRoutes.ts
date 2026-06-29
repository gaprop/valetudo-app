import { Router } from "express";
import { WorkoutsController } from "../controllers/workoutsController";
import { asyncHandler } from "../middleware/errors";
import {
  validatePositivePathID,
  validateWorkoutBody,
  validateWorkoutSetBody,
} from "../middleware/validation";

export const workoutsRoutes = Router();

workoutsRoutes.get("/", asyncHandler(WorkoutsController.listWorkouts));
workoutsRoutes.post(
  "/",
  validateWorkoutBody,
  asyncHandler(WorkoutsController.createWorkout)
);
workoutsRoutes.delete(
  "/:id",
  validatePositivePathID("id", "workout id"),
  asyncHandler(WorkoutsController.deleteWorkout)
);
workoutsRoutes.post(
  "/:id/sets",
  validatePositivePathID("id", "workout id"),
  validateWorkoutSetBody,
  asyncHandler(WorkoutsController.createWorkoutSet)
);
workoutsRoutes.patch(
  "/:id/sets/:setID",
  validatePositivePathID("id", "workout id"),
  validatePositivePathID("setID", "set id"),
  validateWorkoutSetBody,
  asyncHandler(WorkoutsController.updateWorkoutSet)
);
workoutsRoutes.delete(
  "/:id/sets/:setID",
  validatePositivePathID("id", "workout id"),
  validatePositivePathID("setID", "set id"),
  asyncHandler(WorkoutsController.deleteWorkoutSet)
);
