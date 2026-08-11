import type {
  ValidatedTrainingSessionBody,
  ValidatedTrainingSetBody,
} from "../middleware/validation";
import { TrainingSessionEntriesService } from "./trainingSessions/trainingSessionEntriesService";
import { TrainingSessionSetsService } from "./trainingSessions/trainingSessionSetsService";

export class TrainingSessionsService {
  static async listTrainingSessions(userID: string) {
    return TrainingSessionEntriesService.list(userID);
  }

  static async createTrainingSession(
    userID: string,
    trainingSession: ValidatedTrainingSessionBody
  ) {
    return TrainingSessionEntriesService.create(userID, trainingSession);
  }

  static async deleteTrainingSession(userID: string, trainingSessionID: string) {
    return TrainingSessionEntriesService.delete(userID, trainingSessionID);
  }

  static async createTrainingSet(
    userID: string,
    trainingSessionID: string,
    trainingSet: ValidatedTrainingSetBody
  ) {
    return TrainingSessionSetsService.create(
      userID,
      trainingSessionID,
      trainingSet
    );
  }

  static async updateTrainingSet(
    userID: string,
    trainingSessionID: string,
    setID: string,
    trainingSet: ValidatedTrainingSetBody
  ) {
    return TrainingSessionSetsService.update(
      userID,
      trainingSessionID,
      setID,
      trainingSet
    );
  }

  static async deleteTrainingSet(
    userID: string,
    trainingSessionID: string,
    setID: string
  ) {
    return TrainingSessionSetsService.delete(userID, trainingSessionID, setID);
  }
}
