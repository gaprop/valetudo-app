import type { FormEvent } from "react";
import type { SetForm, Workout } from "../types";
import { formatWeight, labelFor, maxWeight } from "../workouts";
import { WorkoutSetRow } from "./WorkoutSetRow";

type WorkoutEntryProps = {
  workout: Workout;
  setForm: SetForm;
  savingSetId: number | null;
  updatingSetId: number | null;
  deletingSetId: number | null;
  isOpen: boolean;
  onToggle: () => void;
  onSetFormChange: (field: keyof SetForm, value: string) => void;
  onAddSet: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateSet: (setID: number, form: SetForm) => void;
  onDeleteSet: (setID: number) => void;
};

export function WorkoutEntry({
  workout,
  setForm,
  savingSetId,
  updatingSetId,
  deletingSetId,
  isOpen,
  onToggle,
  onSetFormChange,
  onAddSet,
  onUpdateSet,
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
                    updatingSetId={updatingSetId}
                    deletingSetId={deletingSetId}
                    onUpdate={(form) => onUpdateSet(set.id, form)}
                    onDelete={() => onDeleteSet(set.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <form
            className="grid gap-3 rounded border border-neutral-800 bg-neutral-950 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
            onSubmit={onAddSet}
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                New set
              </p>
              <div className="mt-2 grid grid-cols-2 divide-x divide-neutral-700 overflow-hidden rounded border border-neutral-800 text-center text-sm font-semibold text-white">
                <label className="flex items-center bg-neutral-900 px-3 py-2 text-center">
                  <input
                    aria-label="New set weight in kg"
                    className="min-w-0 flex-1 bg-transparent text-center text-white outline-none"
                    type="number"
                    min="0"
                    step="0.5"
                    value={setForm.weight}
                    onChange={(event) =>
                      onSetFormChange("weight", event.target.value)
                    }
                    required
                  />
                  <span className="ml-2 shrink-0 text-xs font-semibold uppercase text-neutral-500">
                    kg
                  </span>
                </label>
                <label className="flex items-center bg-neutral-900 px-3 py-2 text-center">
                  <input
                    aria-label="New set reps"
                    className="min-w-0 flex-1 bg-transparent text-center text-white outline-none"
                    type="number"
                    min="1"
                    step="1"
                    value={setForm.reps}
                    onChange={(event) =>
                      onSetFormChange("reps", event.target.value)
                    }
                    required
                  />
                  <span className="ml-2 shrink-0 text-xs font-semibold uppercase text-neutral-500">
                    reps
                  </span>
                </label>
              </div>
            </div>
            <div className="grid gap-2 sm:w-40">
              <button
                className="w-full rounded bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-700"
                type="submit"
                disabled={savingSetId === workout.id}
              >
                {savingSetId === workout.id ? "Adding" : "Add set"}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
