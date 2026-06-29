import type { Request, Response } from "express";
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

  static async createExercise(req: Request, res: Response) {
    try {
      const exercise = await ExercisesService.createExercise(req.body?.label);
      res.status(201).json(exercise);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteExercise(req: Request, res: Response) {
    try {
      await ExercisesService.deleteExercise(req.params.value ?? "");
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
