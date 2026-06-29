import { Router } from "express";
import { ExercisesController } from "../controllers/exercisesController";
import { asyncHandler } from "../middleware/errors";
import {
  validateExerciseBody,
  validateExercisePathValue,
} from "../middleware/validation";

export const exercisesRoutes = Router();

exercisesRoutes.get("/", asyncHandler(ExercisesController.listExercises));
exercisesRoutes.post(
  "/",
  validateExerciseBody,
  asyncHandler(ExercisesController.createExercise)
);
exercisesRoutes.delete(
  "/:value",
  validateExercisePathValue,
  asyncHandler(ExercisesController.deleteExercise)
);
