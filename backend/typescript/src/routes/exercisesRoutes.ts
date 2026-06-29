import { Router } from "express";
import { ExercisesController } from "../controllers/exercisesController";
import { asyncHandler } from "../middleware/errors";

export const exercisesRoutes = Router();

exercisesRoutes.get("/", asyncHandler(ExercisesController.listExercises));
exercisesRoutes.post("/", asyncHandler(ExercisesController.createExercise));
exercisesRoutes.delete("/:value", asyncHandler(ExercisesController.deleteExercise));
