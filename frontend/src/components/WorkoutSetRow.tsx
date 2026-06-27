import type { WorkoutSet } from "../types";
import { formatWeight } from "../workouts";

type WorkoutSetRowProps = {
  workoutSet: WorkoutSet;
  deletingSetId: number | null;
  onDelete: () => void;
};

export function WorkoutSetRow({
  workoutSet,
  deletingSetId,
  onDelete,
}: WorkoutSetRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-neutral-500">
          Set {workoutSet.setNumber}
        </p>
        <div className="mt-1 grid grid-cols-2 divide-x divide-neutral-700 text-center text-sm font-semibold text-white">
          <span className="px-3">{formatWeight(workoutSet.weight)}</span>
          <span className="px-3">{workoutSet.reps} reps</span>
        </div>
      </div>
      <button
        className="shrink-0 rounded border border-neutral-700 px-2 py-1 text-xs font-semibold text-neutral-300 transition hover:border-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        onClick={onDelete}
        disabled={deletingSetId === workoutSet.id}
      >
        {deletingSetId === workoutSet.id ? "Removing" : "Remove"}
      </button>
    </div>
  );
}
