import { Router } from "express";
import { ExerciseCatalogController } from "../controllers/exerciseCatalogController";
import { asyncHandler } from "../middleware/errors";
import {
  validateExerciseBody,
  validateExercisePathValue,
} from "../middleware/validation";

export const exercisesRoutes = Router();

exercisesRoutes.get("/", asyncHandler(ExerciseCatalogController.listExercises));
exercisesRoutes.post(
  "/",
  validateExerciseBody,
  asyncHandler(ExerciseCatalogController.createExercise)
);
exercisesRoutes.delete(
  "/:value",
  validateExercisePathValue,
  asyncHandler(ExerciseCatalogController.deleteExercise)
);
