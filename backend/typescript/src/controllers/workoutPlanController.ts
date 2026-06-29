import type { Request, Response } from "express";
import type {
  ValidatedWorkoutPlanDayBody,
  ValidatedWorkoutPlanItemBody,
} from "../middleware/validation";
import { WorkoutPlanService } from "../services/workoutPlanService";
import { handleControllerError } from "./helpers";

export class WorkoutPlanController {
  static async listWorkoutPlanDays(_req: Request, res: Response) {
    try {
      const days = await WorkoutPlanService.listWorkoutPlanDays();
      res.json(days);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkoutPlanDay(_req: Request, res: Response) {
    try {
      const day = await WorkoutPlanService.createWorkoutPlanDay(
        res.locals.workoutPlanDayBody as ValidatedWorkoutPlanDayBody
      );
      res.status(201).json(day);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkoutPlanDay(_req: Request, res: Response) {
    try {
      const dayID = res.locals.id as number;
      await WorkoutPlanService.deleteWorkoutPlanDay(dayID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkoutPlanItem(_req: Request, res: Response) {
    try {
      const dayID = res.locals.id as number;
      const item = await WorkoutPlanService.createWorkoutPlanItem(
        dayID,
        res.locals.workoutPlanItemBody as ValidatedWorkoutPlanItemBody
      );
      res.status(201).json(item);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkoutPlanItem(_req: Request, res: Response) {
    try {
      const dayID = res.locals.id as number;
      const itemID = res.locals.itemID as number;
      await WorkoutPlanService.deleteWorkoutPlanItem(dayID, itemID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
