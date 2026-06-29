import { Router } from "express";
import {
  createExercise,
  deleteExercise,
  listExercises,
} from "../controllers/exercisesController";
import { asyncHandler } from "../middleware/errors";

export const exercisesRoutes = Router();

exercisesRoutes.get("/", asyncHandler(listExercises));
exercisesRoutes.post("/", asyncHandler(createExercise));
exercisesRoutes.delete("/:value", asyncHandler(deleteExercise));
