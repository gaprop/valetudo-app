import type { ExerciseOption, Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";

type StatusSummaryProps = {
  exercises: ExerciseOption[];
  currentWorkout?: Workout;
};

export function StatusSummary({ exercises, currentWorkout }: StatusSummaryProps) {
  return (
    <div className="rounded border border-primary-800 bg-primary-950/50 px-4 py-3 text-sm text-primary-100">
      {currentWorkout ? (
        <span>
          Latest {labelFor(exercises, currentWorkout.exerciseType)}:{" "}
          <strong>{currentWorkout.sets.length} sets</strong>, best at{" "}
          <strong>{formatWeight(maxWeight(currentWorkout.sets))}</strong>
        </span>
      ) : (
        <span>No sets logged for this exercise yet.</span>
      )}
    </div>
  );
}
