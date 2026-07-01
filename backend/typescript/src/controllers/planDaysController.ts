import type { Request, Response } from "express";
import type {
  ValidatedPlanDayBody,
  ValidatedPlanExerciseBody,
} from "../middleware/validation";
import { PlanDaysService } from "../services/planDaysService";
import { handleControllerError } from "./helpers";

export class PlanDaysController {
  static async listPlanDays(_req: Request, res: Response) {
    try {
      const days = await PlanDaysService.listPlanDays(res.locals.userID as string);
      res.json(days);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createPlanDay(_req: Request, res: Response) {
    try {
      const day = await PlanDaysService.createPlanDay(
        res.locals.userID as string,
        res.locals.planDayBody as ValidatedPlanDayBody
      );
      res.status(201).json(day);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deletePlanDay(_req: Request, res: Response) {
    try {
      const dayID = res.locals.id as string;
      await PlanDaysService.deletePlanDay(res.locals.userID as string, dayID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createPlanExercise(_req: Request, res: Response) {
    try {
      const dayID = res.locals.id as string;
      const item = await PlanDaysService.createPlanExercise(
        res.locals.userID as string,
        dayID,
        res.locals.planExerciseBody as ValidatedPlanExerciseBody
      );
      res.status(201).json(item);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deletePlanExercise(_req: Request, res: Response) {
    try {
      const dayID = res.locals.id as string;
      const itemID = res.locals.itemID as string;
      await PlanDaysService.deletePlanExercise(res.locals.userID as string, dayID, itemID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
