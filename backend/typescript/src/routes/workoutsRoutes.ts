import { Router } from "express";
import {
  createWorkout,
  createWorkoutSet,
  deleteWorkout,
  deleteWorkoutSet,
  listWorkouts,
  updateWorkoutSet,
} from "../controllers/workoutsController";
import { asyncHandler } from "../middleware/errors";

export const workoutsRoutes = Router();

workoutsRoutes.get("/", asyncHandler(listWorkouts));
workoutsRoutes.post("/", asyncHandler(createWorkout));
workoutsRoutes.delete("/:id", asyncHandler(deleteWorkout));
workoutsRoutes.post("/:id/sets", asyncHandler(createWorkoutSet));
workoutsRoutes.patch("/:id/sets/:setID", asyncHandler(updateWorkoutSet));
workoutsRoutes.delete("/:id/sets/:setID", asyncHandler(deleteWorkoutSet));
