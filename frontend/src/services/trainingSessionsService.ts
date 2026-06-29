import { api } from "../api";
import type {
  CreateTrainingSessionRequest,
  CreateTrainingSetRequest,
  ID,
  UpdateTrainingSetRequest,
  TrainingSession,
  TrainingSet,
} from "../types";

export const trainingSessionsService = {
  async list(): Promise<TrainingSession[]> {
    const response = await api.get<TrainingSession[]>("/api/workouts");
    return response.data;
  },

  async create(input: CreateTrainingSessionRequest): Promise<TrainingSession> {
    const response = await api.post<TrainingSession>("/api/workouts", input);
    return response.data;
  },

  async delete(input: { trainingSessionID: ID }): Promise<void> {
    await api.delete(`/api/workouts/${input.trainingSessionID}`);
  },

  async addSet(input: CreateTrainingSetRequest): Promise<TrainingSet> {
    const response = await api.post<TrainingSet>(
      `/api/workouts/${input.trainingSessionID}/sets`,
      { weight: input.weight, reps: input.reps }
    );
    return response.data;
  },

  async updateSet(input: UpdateTrainingSetRequest): Promise<TrainingSet> {
    const response = await api.patch<TrainingSet>(
      `/api/workouts/${input.trainingSessionID}/sets/${input.setID}`,
      { weight: input.weight, reps: input.reps }
    );
    return response.data;
  },

  async deleteSet(input: { trainingSessionID: ID; setID: ID }): Promise<void> {
    await api.delete(`/api/workouts/${input.trainingSessionID}/sets/${input.setID}`);
  },
};
