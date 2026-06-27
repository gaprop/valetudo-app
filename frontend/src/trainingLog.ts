import type { Workout } from "./types";

export function findPreviousWorkoutForSelection(
  workouts: Workout[],
  selectedWorkout: Workout | null
): Workout | undefined {
  if (!selectedWorkout) {
    return undefined;
  }

  return [...workouts].reverse().find((workout) => {
    if (
      workout.exerciseType !== selectedWorkout.exerciseType ||
      workout.sets.length === 0
    ) {
      return false;
    }

    if (workout.trainingDate !== selectedWorkout.trainingDate) {
      return workout.trainingDate < selectedWorkout.trainingDate;
    }

    return (
      Date.parse(workout.createdAt) < Date.parse(selectedWorkout.createdAt) ||
      workout.id < selectedWorkout.id
    );
  });
}
