import type { FormEvent } from "react";
import type { Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";
import { WorkoutSetRow } from "./WorkoutSetRow";

type WorkoutEntryProps = {
  workout: Workout;
  setWeight: string;
  savingSetId: number | null;
  deletingSetId: number | null;
  isOpen: boolean;
  onToggle: () => void;
  onSetWeightChange: (weight: string) => void;
  onAddSet: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteSet: (setID: number) => void;
};

export function WorkoutEntry({
  workout,
  setWeight,
  savingSetId,
  deletingSetId,
  isOpen,
  onToggle,
  onSetWeightChange,
  onAddSet,
  onDeleteSet,
}: WorkoutEntryProps) {
  return (
    <article className="bg-neutral-900">
      <button
        className="grid w-full cursor-pointer gap-3 border-l-4 border-transparent bg-neutral-800/40 px-5 py-4 text-left transition hover:border-primary-600 hover:bg-neutral-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-700 sm:grid-cols-[1fr_auto_auto]"
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className="min-w-0">
          <span className="block text-base font-semibold text-white">
            {labelFor(workout.exerciseType)}
          </span>
          <span className="mt-1 block text-sm text-neutral-400">
            {workout.trainingDate}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-2 text-sm text-neutral-300 sm:justify-end">
          <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
            {workout.sets.length} {workout.sets.length === 1 ? "set" : "sets"}
          </span>
          <span className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1">
            Best {formatWeight(maxWeight(workout.sets))}
          </span>
        </span>
        <span className="flex h-9 min-w-24 items-center justify-center rounded border border-primary-800 bg-primary-950/60 px-3 text-sm font-semibold text-primary-100 sm:justify-self-end">
          {isOpen ? "Close" : "Open"}
        </span>
      </button>

      {isOpen && (
        <div className="grid gap-5 border-t border-neutral-800 bg-neutral-950/50 px-5 py-5">
          <div>
            {workout.sets.length === 0 ? (
              <p className="text-sm text-neutral-500">No sets added yet.</p>
            ) : (
              <div className="grid gap-2">
                {workout.sets.map((set) => (
                  <WorkoutSetRow
                    key={set.id}
                    workoutSet={set}
                    deletingSetId={deletingSetId}
                    onDelete={() => onDeleteSet(set.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <form className="flex max-w-sm items-end gap-3" onSubmit={onAddSet}>
            <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium text-neutral-300">
              Weight
              <input
                className="input"
                type="number"
                min="0"
                step="0.5"
                placeholder="kg"
                value={setWeight}
                onChange={(event) => onSetWeightChange(event.target.value)}
                required
              />
            </label>
            <button
              className="h-[46px] rounded bg-primary-600 px-4 text-sm font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
              type="submit"
              disabled={savingSetId === workout.id}
            >
              {savingSetId === workout.id ? "Adding..." : "Add set"}
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
