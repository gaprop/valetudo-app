import type { TrainingSession, PlanDay, PlanExercise, TrainingSet } from "./types";

export function sortTrainingSessions(trainingSessions: TrainingSession[]): TrainingSession[] {
  return [...trainingSessions].sort((a, b) => {
    if (a.trainingDate !== b.trainingDate) {
      return a.trainingDate.localeCompare(b.trainingDate);
    }
    return (
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
    );
  });
}

export function sortTrainingSets(sets: TrainingSet[]): TrainingSet[] {
  return [...sets].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
  );
}

export function sortPlanDays(days: PlanDay[]): PlanDay[] {
  return [...days].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
  );
}

export function sortPlanItems(items: PlanExercise[]): PlanExercise[] {
  return [...items].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
  );
}
