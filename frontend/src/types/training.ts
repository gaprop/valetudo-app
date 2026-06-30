import type { ExerciseValue } from "./exercises";
import type { ID } from "./common";

export type TrainingSet = {
  id: ID;
  weight: number;
  reps: number;
  createdAt: string;
};

export type TrainingSession = {
  id: ID;
  trainingDate: string;
  exerciseType: ExerciseValue;
  sets: TrainingSet[];
  createdAt: string;
};

export type TrainingSessionForm = {
  trainingDate: string;
  exerciseType: ExerciseValue;
};

export type CreateTrainingSessionRequest = {
  trainingDate: string;
  exerciseType: ExerciseValue;
};

export type SetForm = {
  weight: string;
  reps: string;
};

export type TrainingSetRequest = {
  weight: number;
  reps: number;
};

export type CreateTrainingSetRequest = TrainingSetRequest & {
  trainingSessionID: ID;
};

export type UpdateTrainingSetRequest = TrainingSetRequest & {
  trainingSessionID: ID;
  setID: ID;
};
