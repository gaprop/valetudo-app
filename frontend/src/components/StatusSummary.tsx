import type { Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";

type StatusSummaryProps = {
  currentWorkout?: Workout;
};

export function StatusSummary({ currentWorkout }: StatusSummaryProps) {
  return (
    <div className="rounded border border-primary-800 bg-primary-950/50 px-4 py-3 text-sm text-primary-100">
      {currentWorkout ? (
        <span>
          Latest {labelFor(currentWorkout.exerciseType)}:{" "}
          <strong>{currentWorkout.sets.length} sets</strong>, best at{" "}
          <strong>{formatWeight(maxWeight(currentWorkout.sets))}</strong>
        </span>
      ) : (
        <span>No sets logged for this training type yet.</span>
      )}
    </div>
  );
}
