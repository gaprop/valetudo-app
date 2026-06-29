import type { Request, Response } from "express";
import { WorkoutPlanService } from "../services/workoutPlanService";
import { handleControllerError, parsePositivePathID } from "./helpers";

export class WorkoutPlanController {
  static async listWorkoutPlanDays(_req: Request, res: Response) {
    try {
      const days = await WorkoutPlanService.listWorkoutPlanDays();
      res.json(days);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkoutPlanDay(req: Request, res: Response) {
    try {
      const day = await WorkoutPlanService.createWorkoutPlanDay(req.body?.name);
      res.status(201).json(day);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkoutPlanDay(req: Request, res: Response) {
    try {
      const dayID = parsePositivePathID(req, "id", "day id");
      await WorkoutPlanService.deleteWorkoutPlanDay(dayID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkoutPlanItem(req: Request, res: Response) {
    try {
      const dayID = parsePositivePathID(req, "id", "day id");
      const item = await WorkoutPlanService.createWorkoutPlanItem(
        dayID,
        req.body?.exerciseType
      );
      res.status(201).json(item);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkoutPlanItem(req: Request, res: Response) {
    try {
      const dayID = parsePositivePathID(req, "id", "day id");
      const itemID = parsePositivePathID(req, "itemID", "item id");
      await WorkoutPlanService.deleteWorkoutPlanItem(dayID, itemID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
