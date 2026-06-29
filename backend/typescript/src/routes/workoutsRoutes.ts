import { Router } from "express";
import { WorkoutsController } from "../controllers/workoutsController";
import { asyncHandler } from "../middleware/errors";

export const workoutsRoutes = Router();

workoutsRoutes.get("/", asyncHandler(WorkoutsController.listWorkouts));
workoutsRoutes.post("/", asyncHandler(WorkoutsController.createWorkout));
workoutsRoutes.delete("/:id", asyncHandler(WorkoutsController.deleteWorkout));
workoutsRoutes.post("/:id/sets", asyncHandler(WorkoutsController.createWorkoutSet));
workoutsRoutes.patch(
  "/:id/sets/:setID",
  asyncHandler(WorkoutsController.updateWorkoutSet)
);
workoutsRoutes.delete(
  "/:id/sets/:setID",
  asyncHandler(WorkoutsController.deleteWorkoutSet)
);
