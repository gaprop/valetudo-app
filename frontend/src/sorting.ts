import type { Workout, WorkoutPlanDay, WorkoutPlanItem, WorkoutSet } from "./types";

export function sortWorkouts(workouts: Workout[]): Workout[] {
  return [...workouts].sort((a, b) => {
    if (a.trainingDate !== b.trainingDate) {
      return a.trainingDate.localeCompare(b.trainingDate);
    }
    return (
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
    );
  });
}

export function sortWorkoutSets(sets: WorkoutSet[]): WorkoutSet[] {
  return [...sets].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
  );
}

export function sortPlanDays(days: WorkoutPlanDay[]): WorkoutPlanDay[] {
  return [...days].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
  );
}

export function sortPlanItems(items: WorkoutPlanItem[]): WorkoutPlanItem[] {
  return [...items].sort(
    (a, b) =>
      Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
      a.id.localeCompare(b.id)
  );
}
