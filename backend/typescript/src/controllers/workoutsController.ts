import type { Request, Response } from "express";
import type {
  ValidatedWorkoutBody,
  ValidatedWorkoutSetBody,
} from "../middleware/validation";
import { WorkoutsService } from "../services/workoutsService";
import { handleControllerError } from "./helpers";

export class WorkoutsController {
  static async listWorkouts(_req: Request, res: Response) {
    try {
      const workouts = await WorkoutsService.listWorkouts();
      res.json(workouts);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkout(_req: Request, res: Response) {
    try {
      const workout = await WorkoutsService.createWorkout(
        res.locals.workoutBody as ValidatedWorkoutBody
      );
      res.status(201).json(workout);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkout(_req: Request, res: Response) {
    try {
      const workoutID = res.locals.id as number;
      await WorkoutsService.deleteWorkout(workoutID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkoutSet(_req: Request, res: Response) {
    try {
      const workoutID = res.locals.id as number;
      const workoutSet = await WorkoutsService.createWorkoutSet(
        workoutID,
        res.locals.workoutSetBody as ValidatedWorkoutSetBody
      );
      res.status(201).json(workoutSet);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async updateWorkoutSet(_req: Request, res: Response) {
    try {
      const workoutID = res.locals.id as number;
      const setID = res.locals.setID as number;
      const workoutSet = await WorkoutsService.updateWorkoutSet(
        workoutID,
        setID,
        res.locals.workoutSetBody as ValidatedWorkoutSetBody
      );
      res.json(workoutSet);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkoutSet(_req: Request, res: Response) {
    try {
      const workoutID = res.locals.id as number;
      const setID = res.locals.setID as number;
      await WorkoutsService.deleteWorkoutSet(workoutID, setID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
