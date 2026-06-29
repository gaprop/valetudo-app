import type { Request, Response } from "express";
import type { ValidatedExerciseBody } from "../middleware/validation";
import { ExercisesService } from "../services/exercisesService";
import { handleControllerError } from "./helpers";

export class ExercisesController {
  static async listExercises(_req: Request, res: Response) {
    try {
      const exercises = await ExercisesService.listExercises();
      res.json(exercises);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createExercise(_req: Request, res: Response) {
    try {
      const exercise = await ExercisesService.createExercise(
        res.locals.exerciseBody as ValidatedExerciseBody
      );
      res.status(201).json(exercise);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteExercise(_req: Request, res: Response) {
    try {
      await ExercisesService.deleteExercise(res.locals.exerciseValue as string);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
