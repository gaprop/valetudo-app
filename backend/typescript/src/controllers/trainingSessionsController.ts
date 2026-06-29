import type { Request, Response } from "express";
import type {
  ValidatedTrainingSessionBody,
  ValidatedTrainingSetBody,
} from "../middleware/validation";
import { TrainingSessionsService } from "../services/trainingSessionsService";
import { handleControllerError } from "./helpers";

export class TrainingSessionsController {
  static async listTrainingSessions(_req: Request, res: Response) {
    try {
      const trainingSessions = await TrainingSessionsService.listTrainingSessions();
      res.json(trainingSessions);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createTrainingSession(_req: Request, res: Response) {
    try {
      const trainingSession = await TrainingSessionsService.createTrainingSession(
        res.locals.trainingSessionBody as ValidatedTrainingSessionBody
      );
      res.status(201).json(trainingSession);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteTrainingSession(_req: Request, res: Response) {
    try {
      const trainingSessionID = res.locals.id as string;
      await TrainingSessionsService.deleteTrainingSession(trainingSessionID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createTrainingSet(_req: Request, res: Response) {
    try {
      const trainingSessionID = res.locals.id as string;
      const trainingSet = await TrainingSessionsService.createTrainingSet(
        trainingSessionID,
        res.locals.trainingSetBody as ValidatedTrainingSetBody
      );
      res.status(201).json(trainingSet);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async updateTrainingSet(_req: Request, res: Response) {
    try {
      const trainingSessionID = res.locals.id as string;
      const setID = res.locals.setID as string;
      const trainingSet = await TrainingSessionsService.updateTrainingSet(
        trainingSessionID,
        setID,
        res.locals.trainingSetBody as ValidatedTrainingSetBody
      );
      res.json(trainingSet);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteTrainingSet(_req: Request, res: Response) {
    try {
      const trainingSessionID = res.locals.id as string;
      const setID = res.locals.setID as string;
      await TrainingSessionsService.deleteTrainingSet(trainingSessionID, setID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
