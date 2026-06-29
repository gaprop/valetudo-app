import type { Request, Response } from "express";
import { WorkoutsService } from "../services/workoutsService";
import { handleControllerError, parsePositivePathID } from "./helpers";

export class WorkoutsController {
  static async listWorkouts(_req: Request, res: Response) {
    try {
      const workouts = await WorkoutsService.listWorkouts();
      res.json(workouts);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkout(req: Request, res: Response) {
    try {
      const workout = await WorkoutsService.createWorkout(
        req.body?.trainingDate,
        req.body?.exerciseType
      );
      res.status(201).json(workout);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkout(req: Request, res: Response) {
    try {
      const workoutID = parsePositivePathID(req, "id", "workout id");
      await WorkoutsService.deleteWorkout(workoutID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async createWorkoutSet(req: Request, res: Response) {
    try {
      const workoutID = parsePositivePathID(req, "id", "workout id");
      const workoutSet = await WorkoutsService.createWorkoutSet(
        workoutID,
        req.body
      );
      res.status(201).json(workoutSet);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async updateWorkoutSet(req: Request, res: Response) {
    try {
      const workoutID = parsePositivePathID(req, "id", "workout id");
      const setID = parsePositivePathID(req, "setID", "set id");
      const workoutSet = await WorkoutsService.updateWorkoutSet(
        workoutID,
        setID,
        req.body
      );
      res.json(workoutSet);
    } catch (error) {
      handleControllerError(error, res);
    }
  }

  static async deleteWorkoutSet(req: Request, res: Response) {
    try {
      const workoutID = parsePositivePathID(req, "id", "workout id");
      const setID = parsePositivePathID(req, "setID", "set id");
      await WorkoutsService.deleteWorkoutSet(workoutID, setID);
      res.status(204).send();
    } catch (error) {
      handleControllerError(error, res);
    }
  }
}
