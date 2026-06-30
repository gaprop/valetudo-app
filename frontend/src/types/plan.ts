import type { ExerciseValue } from "./exercises";
import type { ID } from "./common";

export type PlanExercise = {
  id: ID;
  exerciseType: ExerciseValue;
  createdAt: string;
};

export type PlanDay = {
  id: ID;
  name: string;
  items: PlanExercise[];
  createdAt: string;
};

export type CreatePlanDayRequest = {
  name: string;
};

export type CreatePlanExerciseRequest = {
  dayID: ID;
  exerciseType: ExerciseValue;
};
