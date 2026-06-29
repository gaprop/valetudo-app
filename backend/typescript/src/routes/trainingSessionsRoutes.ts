import { Router } from "express";
import { TrainingSessionsController } from "../controllers/trainingSessionsController";
import { asyncHandler } from "../middleware/errors";
import {
  validateUUIDPathID,
  validateTrainingSessionBody,
  validateTrainingSetBody,
} from "../middleware/validation";

export const trainingSessionsRoutes = Router();

trainingSessionsRoutes.get("/", asyncHandler(TrainingSessionsController.listTrainingSessions));
trainingSessionsRoutes.post(
  "/",
  validateTrainingSessionBody,
  asyncHandler(TrainingSessionsController.createTrainingSession)
);
trainingSessionsRoutes.delete(
  "/:id",
  validateUUIDPathID("id", "trainingSession id"),
  asyncHandler(TrainingSessionsController.deleteTrainingSession)
);
trainingSessionsRoutes.post(
  "/:id/sets",
  validateUUIDPathID("id", "trainingSession id"),
  validateTrainingSetBody,
  asyncHandler(TrainingSessionsController.createTrainingSet)
);
trainingSessionsRoutes.patch(
  "/:id/sets/:setID",
  validateUUIDPathID("id", "trainingSession id"),
  validateUUIDPathID("setID", "set id"),
  validateTrainingSetBody,
  asyncHandler(TrainingSessionsController.updateTrainingSet)
);
trainingSessionsRoutes.delete(
  "/:id/sets/:setID",
  validateUUIDPathID("id", "trainingSession id"),
  validateUUIDPathID("setID", "set id"),
  asyncHandler(TrainingSessionsController.deleteTrainingSet)
);
