import type { Exercise, Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";

type StatusSummaryProps = {
  exercises: Exercise[];
  currentWorkout?: Workout;
  hasSelection: boolean;
};

export function StatusSummary({
  exercises,
  currentWorkout,
  hasSelection,
}: StatusSummaryProps) {
  return (
    <div className="rounded border border-primary-800 bg-primary-950/50 px-4 py-3 text-sm text-primary-100">
      {!hasSelection ? (
        <span>Nothing is selected</span>
      ) : currentWorkout ? (
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
