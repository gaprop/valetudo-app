import { Router } from "express";
import { WorkoutsController } from "../controllers/workoutsController";
import { asyncHandler } from "../middleware/errors";
import {
  validateUUIDPathID,
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
  validateUUIDPathID("id", "workout id"),
  asyncHandler(WorkoutsController.deleteWorkout)
);
workoutsRoutes.post(
  "/:id/sets",
  validateUUIDPathID("id", "workout id"),
  validateWorkoutSetBody,
  asyncHandler(WorkoutsController.createWorkoutSet)
);
workoutsRoutes.patch(
  "/:id/sets/:setID",
  validateUUIDPathID("id", "workout id"),
  validateUUIDPathID("setID", "set id"),
  validateWorkoutSetBody,
  asyncHandler(WorkoutsController.updateWorkoutSet)
);
workoutsRoutes.delete(
  "/:id/sets/:setID",
  validateUUIDPathID("id", "workout id"),
  validateUUIDPathID("setID", "set id"),
  asyncHandler(WorkoutsController.deleteWorkoutSet)
);
